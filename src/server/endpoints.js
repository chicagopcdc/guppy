import esInstance from './es/index';
import { gitVersion, gitCommit } from './version';
import log from './logger';
import config from './config';

export const statusRouter = async (req, res, next) => {
  try {
    const data = await esInstance.getAllESIndices();
    res.send(data);
  } catch (err) {
    next(err);
  }
  return 0;
};

export const versionRouter = async (req, res) => {
  res.send({
    version: gitVersion,
    commit: gitCommit,
  });
  return 0;
};


const getVersionNumber = (indexName) => {
  const parts = indexName.split('_');
  if (parts.length < 2) return null;

  const version = parseInt(parts[1], 10);
  return Number.isNaN(version) ? null : version;
};

export const versionData = async (req, res, next) => {
  try {
    const aliases = [...new Set(config.esConfig.indices.map(({ index }) => index))];

    const data = await esInstance.getAllESIndices();
    log.info('[_data_version] ', JSON.stringify(data, null, 4));

    var result = {}

    if (typeof(data) != "undefined" && "statusCode" in data && data["statusCode"] == 200 && "indices" in data) {
      for (const [key, value] of Object.entries(data["indices"])) {
        for (const alias of aliases){
          if ("aliases" in value && alias in value["aliases"]){
            if (!(alias in result)) {
              result[alias] = key
            }
            else {
              const currentVersion = getVersionNumber(result[alias]);
              const candidateVersion = getVersionNumber(key);

              if (currentVersion === null || candidateVersion === null) {
                log.error(
                  `[guppy/_data_version] invalid ES index name format: current=${result[alias]}, candidate=${key}`,
                );
                continue;
              }

              if (candidateVersion > currentVersion) {
                result[alias] = key;
              }
            }
          }
        }
      }
      // backward compatible behavior:
      // if there is only one configured alias, return just its value
      if (aliases.length === 1) {
        return res.send(result[aliases[0]] || null);
      }

      // if multiple aliases are configured, return all of them
      return res.send(result);
    }
    log.error('ERROR: Something went wrong in selecting the data guppy/_data_version');
    return res.status(500).send('Failed to determine data version');
  } catch (err) {
    return next(err);
  }
};
