// eslint-disable-next-line
import nock from 'nock'; // must import this to enable mock data by nock
import { GraphQLError } from 'graphql';
import getFilterObj from '../filter';
import esInstance from '../index';
import setupMockDataEndpoint from '../../__mocks__/mockDataFromES';
import config from '../../config';

jest.mock('../../config');
jest.mock('../../logger');

setupMockDataEndpoint();
const esIndex = 'gen3-dev-subject';
const esType = 'subject';

describe('Transfer GraphQL filter to ES filter, filter unit', () => {
  test('could transfer graphql filter to ES filter object, empty filter', async () => {
    await esInstance.initialize();
    const gqlFilter1 = {};
    const gqlFilter2 = undefined;
    const gqlFilter3 = null;
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const resultESFilter3 = getFilterObj(esInstance, esIndex, gqlFilter3);
    const expectedESFilter = null;
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
    expect(resultESFilter3).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, "=" operator (for string)', async () => {
    await esInstance.initialize();
    // eq, EQ, =
    const gqlFilter1 = { eq: { gender: 'female' } };
    const gqlFilter2 = { EQ: { gender: 'female' } };
    const gqlFilter3 = { '=': { gender: 'female' } };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const resultESFilter3 = getFilterObj(esInstance, esIndex, gqlFilter3);
    const expectedESFilter = {
      term: {
        gender: 'female',
      },
    };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
    expect(resultESFilter3).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, "in" operator (for string)', async () => {
    await esInstance.initialize();
    // in, IN
    const gqlFilter1 = { in: { gender: ['female', 'unknown'] } };
    const gqlFilter2 = { IN: { gender: ['female', 'unknown'] } };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const expectedESFilter = {
      terms: {
        gender: ['female', 'unknown'],
      },
    };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, "CONTAINS_ANY" operator case insensitive', async () => {
    await esInstance.initialize();

    const filters = [
      { CONTAINS_ANY: { gender: ['female', 'unknown'] } },
      { contains_any: { gender: ['female', 'unknown'] } },
    ];

    const expectedESFilter = {
      terms: {
        gender: ['female', 'unknown'],
      },
    };

    filters.forEach((filter) => {
      expect(getFilterObj(esInstance, esIndex, filter)).toEqual(expectedESFilter);
    });
  });

  test('could transfer graphql filter to ES filter object, "CONTAINS_ALL" operator case insensitive', async () => {
    await esInstance.initialize();

    const filters = [
      { CONTAINS_ALL: { gender: ['female', 'unknown'] } },
      { contains_all: { gender: ['female', 'unknown'] } },
    ];

    const expectedESFilter = {
      bool: {
        must: [
          { term: { gender: 'female' } },
          { term: { gender: 'unknown' } },
        ],
      },
    };

    filters.forEach((filter) => {
      expect(getFilterObj(esInstance, esIndex, filter)).toEqual(expectedESFilter);
    });
  });

  test('could transfer graphql filter to ES filter object, "EXCLUDES_ANY" operator case insensitive', async () => {
    await esInstance.initialize();

    const filters = [
      { EXCLUDES_ANY: { gender: ['female', 'unknown'] } },
      { excludes_any: { gender: ['female', 'unknown'] } },
    ];

    const expectedESFilter = {
      bool: {
        must_not: [
          { term: { gender: 'female' } },
          { term: { gender: 'unknown' } },
        ],
      },
    };

    filters.forEach((filter) => {
      expect(getFilterObj(esInstance, esIndex, filter)).toEqual(expectedESFilter);
    });
  });

  test('could transfer graphql filter to ES filter object, "EXCLUDES_ALL" operator case insensitive', async () => {
    await esInstance.initialize();

    const filters = [
      { EXCLUDES_ALL: { gender: ['female', 'unknown'] } },
      { excludes_all: { gender: ['female', 'unknown'] } },
    ];

    const expectedESFilter = {
      bool: {
        must_not: [
          {
            bool: {
              must: [
                { term: { gender: 'female' } },
                { term: { gender: 'unknown' } },
              ],
            },
          },
        ],
      },
    };

    filters.forEach((filter) => {
      expect(getFilterObj(esInstance, esIndex, filter)).toEqual(expectedESFilter);
    });
  });

  test('could transfer graphql filter to ES filter object, "=" operator (for number)', async () => {
    await esInstance.initialize();
    // eq, EQ, =
    const gqlFilter1 = { eq: { file_count: 10 } };
    const gqlFilter2 = { EQ: { file_count: 10 } };
    const gqlFilter3 = { '=': { file_count: 10 } };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const resultESFilter3 = getFilterObj(esInstance, esIndex, gqlFilter3);
    const expectedESFilter = {
      term: {
        file_count: 10,
      },
    };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
    expect(resultESFilter3).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, "in" operator (for number)', async () => {
    await esInstance.initialize();
    // in, IN
    const gqlFilter1 = { in: { file_count: [10, 20] } };
    const gqlFilter2 = { IN: { file_count: [10, 20] } };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const expectedESFilter = {
      terms: {
        file_count: [10, 20],
      },
    };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, ">" operator', async () => {
    await esInstance.initialize();
    // >, gt, GT
    const gqlFilter1 = { '>': { file_count: 10 } };
    const gqlFilter2 = { gt: { file_count: 10 } };
    const gqlFilter3 = { GT: { file_count: 10 } };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const resultESFilter3 = getFilterObj(esInstance, esIndex, gqlFilter3);
    const expectedESFilter = { range: { file_count: { gt: 10 } } };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
    expect(resultESFilter3).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, ">=" operator', async () => {
    await esInstance.initialize();
    // >=, gte, GTE
    const gqlFilter1 = { '>=': { file_count: 10 } };
    const gqlFilter2 = { gte: { file_count: 10 } };
    const gqlFilter3 = { GTE: { file_count: 10 } };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const resultESFilter3 = getFilterObj(esInstance, esIndex, gqlFilter3);
    const expectedESFilter = { range: { file_count: { gte: 10 } } };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
    expect(resultESFilter3).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, "<" operator', async () => {
    await esInstance.initialize();
    // <, lt, LT
    const gqlFilter1 = { '<': { file_count: 10 } };
    const gqlFilter2 = { lt: { file_count: 10 } };
    const gqlFilter3 = { LT: { file_count: 10 } };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const resultESFilter3 = getFilterObj(esInstance, esIndex, gqlFilter3);
    const expectedESFilter = { range: { file_count: { lt: 10 } } };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
    expect(resultESFilter3).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, "<=" operator', async () => {
    await esInstance.initialize();
    // <=, lte, LTE
    const gqlFilter1 = { '<=': { file_count: 10 } };
    const gqlFilter2 = { lte: { file_count: 10 } };
    const gqlFilter3 = { LTE: { file_count: 10 } };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const resultESFilter3 = getFilterObj(esInstance, esIndex, gqlFilter3);
    const expectedESFilter = { range: { file_count: { lte: 10 } } };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
    expect(resultESFilter3).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, range ">=" and "<=" operator', async () => {
    await esInstance.initialize();
    // <=, lte, LTE
    const gqlFilter1 = { and: [{ '<=': { file_count: 20 } }, { '>=': { file_count: 10 } }] };
    const gqlFilter2 = { and: [{ lte: { file_count: 20 } }, { gte: { file_count: 10 } }] };
    const gqlFilter3 = { and: [{ LTE: { file_count: 20 } }, { GTE: { file_count: 10 } }] };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const resultESFilter3 = getFilterObj(esInstance, esIndex, gqlFilter3);
    const expectedESFilter = { bool: { must: [{ range: { file_count: { lte: 20, gte: 10 } } }] } };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
    expect(resultESFilter3).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, range "<=" operator', async () => {
    await esInstance.initialize();
    // <=, lte, LTE
    const gqlFilter1 = { and: [{ '<=': { file_count: 20 } }] };
    const gqlFilter2 = { and: [{ lte: { file_count: 20 } }] };
    const gqlFilter3 = { and: [{ LTE: { file_count: 20 } }] };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const resultESFilter3 = getFilterObj(esInstance, esIndex, gqlFilter3);
    const expectedESFilter = { bool: { must: [{ range: { file_count: { lte: 20 } } }] } };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
    expect(resultESFilter3).toEqual(expectedESFilter);
  });

  test('could transfer graphql filter to ES filter object, "search" operator', async () => {
    await esInstance.initialize();
    const keyword = 'male';
    const gqlFilter1 = { search: { keyword } };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const expectedESFilter1 = { multi_match: { query: keyword, fields: [`*${config.analyzedTextFieldSuffix}`] } };
    expect(resultESFilter1).toEqual(expectedESFilter1);

    const targetFields = ['gender', 'name'];
    const gqlFilter2 = { search: { keyword, fields: targetFields } };
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const expectedTargetFields = targetFields.map((f) => `${f}${config.analyzedTextFieldSuffix}`);
    const expectedESFilter2 = { multi_match: { query: keyword, fields: expectedTargetFields } };
    expect(resultESFilter2).toEqual(expectedESFilter2);

    const targetField = 'gender';
    const gqlFilter3 = { search: { keyword, fields: targetField } };
    const resultESFilter3 = getFilterObj(esInstance, esIndex, gqlFilter3);
    const expectedESFilter3 = { multi_match: { query: keyword, fields: [`${targetField}${config.analyzedTextFieldSuffix}`] } };
    expect(resultESFilter3).toEqual(expectedESFilter3);
  });

  test('could throw err for invalid operator', async () => {
    await esInstance.initialize();

    expect(() => { // for string field
      const gqlFilter = { '+': { gender: 'female' } };
      getFilterObj(esInstance, esIndex, esType, gqlFilter);
    }).toThrow(GraphQLError);

    expect(() => { // for int field
      const gqlFilter = { '+': { file_count: 10 } };
      getFilterObj(esInstance, esIndex, esType, gqlFilter);
    }).toThrow(GraphQLError);
  });

  test('could throw err for nonexisting field', async () => {
    await esInstance.initialize();

    expect(() => { // for string field
      const gqlFilter = { '=': { strange_field: 'value' } };
      getFilterObj(esInstance, esIndex, esType, gqlFilter);
    }).toThrow(GraphQLError);
  });
});

describe('Transfer GraphQL filter to ES filter, combined filter', () => {
  test('could combine filter using binary operator "and"', async () => {
    await esInstance.initialize();
    const gqlFilter1 = {
      AND: [
        { eq: { gender: 'female' } },
        { eq: { file_count: 10 } },
      ],
    };
    const gqlFilter2 = {
      and: [
        { eq: { gender: 'female' } },
        { eq: { file_count: 10 } },
      ],
    };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const expectedESFilter = {
      bool: {
        must: [
          {
            term: {
              gender: 'female',
            },
          },
          {
            term: {
              file_count: 10,
            },
          },
        ],
      },
    };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
  });

  test('could combine filter using binary operator "or"', async () => {
    await esInstance.initialize();
    const gqlFilter1 = {
      OR: [
        { eq: { gender: 'female' } },
        { eq: { file_count: 10 } },
      ],
    };
    const gqlFilter2 = {
      or: [
        { eq: { gender: 'female' } },
        { eq: { file_count: 10 } },
      ],
    };
    const resultESFilter1 = getFilterObj(esInstance, esIndex, gqlFilter1);
    const resultESFilter2 = getFilterObj(esInstance, esIndex, gqlFilter2);
    const expectedESFilter = {
      bool: {
        should: [
          {
            term: {
              gender: 'female',
            },
          },
          {
            term: {
              file_count: 10,
            },
          },
        ],
      },
    };
    expect(resultESFilter1).toEqual(expectedESFilter);
    expect(resultESFilter2).toEqual(expectedESFilter);
  });

  test('could combine filter using nested binary operator', async () => {
    await esInstance.initialize();
    const gqlFilter = {
      OR: [
        {
          and: [
            { eq: { gender: 'female' } },
            { eq: { file_count: 10 } },
          ],
        },
        {
          or: [
            {
              and: [
                { eq: { gender: 'male' } },
                { eq: { file_count: 20 } },
              ],
            },
            {
              and: [
                { eq: { gender: 'unknown' } },
                { eq: { file_count: 30 } },
              ],
            },
          ],
        },
      ],
    };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter);
    const expectedESFilter = {
      bool: {
        should: [
          {
            bool: {
              must: [
                {
                  term: {
                    gender: 'female',
                  },
                },
                {
                  term: {
                    file_count: 10,
                  },
                },
              ],
            },
          },
          {
            bool: {
              should: [
                {
                  bool: {
                    must: [
                      {
                        term: {
                          gender: 'male',
                        },
                      },
                      {
                        term: {
                          file_count: 20,
                        },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    must: [
                      {
                        term: {
                          gender: 'unknown',
                        },
                      },
                      {
                        term: {
                          file_count: 30,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };
    expect(resultESFilter).toEqual(expectedESFilter);
  });
});

describe('Transfer GraphQL filter to ES filter, with other params', () => {
  test('could skip filter field if filterSelf=false, filter unit', async () => {
    await esInstance.initialize();
    const gqlFilter = { eq: { gender: 'female' } };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter, 'gender', false);
    const expectedESFilter = null;
    expect(resultESFilter).toEqual(expectedESFilter);
  });

  test('could skip filter field if filterSelf=false, combined filter', async () => {
    const gqlFilter = {
      AND: [
        { eq: { gender: 'female' } },
        { eq: { file_count: 10 } },
      ],
    };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter, 'gender', false);
    const expectedESFilter = {
      bool: {
        must: [
          {
            term: {
              file_count: 10,
            },
          },
        ],
      },
    };
    expect(resultESFilter).toEqual(expectedESFilter);
  });

  test('could skip filter field if filterSelf=false, with unrelated fields', async () => {
    await esInstance.initialize();
    const gqlFilter = { eq: { gender: 'female' } };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter, 'file_count', false);
    const expectedESFilter = {
      term: {
        gender: 'female',
      },
    };
    expect(resultESFilter).toEqual(expectedESFilter);
  });

  test('could skip filter field if filterSelf=false, with defaultAuthFilter', async () => {
    await esInstance.initialize();
    const defaultAuthFilter = { '=': { gen3_resource_path: 'internal' } };
    const gqlFilter = { eq: { gender: 'female' } };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter, 'gender', false, defaultAuthFilter);
    const expectedESFilter = {
      term: {
        gen3_resource_path: 'internal',
      },
    };
    expect(resultESFilter).toEqual(expectedESFilter);
  });
});

describe('Transfer GraphQL filter to ES filter, leaf filters inside a "nested" filter', () => {
  // The portal sends the full dotted field name (e.g. "visits.days_to_visit") for the leaf
  // field of a nested filter, while guppy used to accept only the name relative to the nested
  // path (e.g. "days_to_visit"). Both forms must produce the same ES filter.
  const expectedNumericFilter = (gte) => ({
    nested: {
      path: 'visits',
      query: {
        range: { 'visits.days_to_visit': { gte } },
      },
    },
  });

  test('numeric range on a nested field, field relative to the nested path', async () => {
    await esInstance.initialize();
    const gqlFilter = { nested: { path: 'visits', '>=': { days_to_visit: 10 } } };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter);
    expect(resultESFilter).toEqual(expectedNumericFilter(10));
  });

  test('numeric range on a nested field, full dotted field name', async () => {
    await esInstance.initialize();
    const gqlFilter = { nested: { path: 'visits', '>=': { 'visits.days_to_visit': 10 } } };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter);
    expect(resultESFilter).toEqual(expectedNumericFilter(10));
  });

  test('text filter on a nested field, full dotted field name', async () => {
    await esInstance.initialize();
    const gqlFilter = { nested: { path: 'visits', '=': { 'visits.visit_label': 'Baseline' } } };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter);
    expect(resultESFilter).toEqual({
      nested: {
        path: 'visits',
        query: { term: { 'visits.visit_label': 'Baseline' } },
      },
    });
  });

  test('range ">=" and "<=" on a nested field, full dotted field name', async () => {
    await esInstance.initialize();
    const gqlFilter = {
      nested: {
        path: 'visits',
        AND: [
          { '>=': { 'visits.days_to_visit': 5 } },
          { '<=': { 'visits.days_to_visit': 30 } },
        ],
      },
    };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter);
    expect(resultESFilter).toEqual({
      nested: {
        path: 'visits',
        query: {
          bool: {
            must: [
              { range: { 'visits.days_to_visit': { gte: 5, lte: 30 } } },
            ],
          },
        },
      },
    });
  });

  test('numeric range on a doubly nested field, full dotted field name', async () => {
    await esInstance.initialize();
    const gqlFilter = {
      nested: { path: 'visits.follow_ups', '>=': { 'visits.follow_ups.days_to_follow_up': 3 } },
    };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter);
    expect(resultESFilter).toEqual({
      nested: {
        path: 'visits.follow_ups',
        query: { range: { 'visits.follow_ups.days_to_follow_up': { gte: 3 } } },
      },
    });
  });

  test('old data-portal shape: upper-case operators with fields relative to the nested path', async () => {
    await esInstance.initialize();
    const gqlFilter = {
      AND: [
        {
          nested: {
            path: 'visits',
            AND: [
              {
                AND: [
                  { GTE: { days_to_visit: 5 } },
                  { LTE: { days_to_visit: 30 } },
                ],
              },
            ],
          },
        },
      ],
    };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter);
    expect(resultESFilter).toEqual({
      bool: {
        must: [
          {
            nested: {
              path: 'visits',
              query: {
                bool: {
                  must: [
                    {
                      bool: {
                        must: [
                          { range: { 'visits.days_to_visit': { gte: 5, lte: 30 } } },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    });
  });

  test('frontend-framework shape: top-level filter combined with a nested range on dotted fields', async () => {
    await esInstance.initialize();
    const gqlFilter = {
      and: [
        { in: { gender: ['female', 'male'] } },
        {
          nested: {
            path: 'visits',
            and: [
              { '>=': { 'visits.days_to_visit': 2 } },
              { '<=': { 'visits.days_to_visit': 106 } },
            ],
          },
        },
      ],
    };
    const resultESFilter = getFilterObj(esInstance, esIndex, gqlFilter);
    expect(resultESFilter).toEqual({
      bool: {
        must: [
          { terms: { gender: ['female', 'male'] } },
          {
            nested: {
              path: 'visits',
              query: {
                bool: {
                  must: [
                    { range: { 'visits.days_to_visit': { gte: 2, lte: 106 } } },
                  ],
                },
              },
            },
          },
        ],
      },
    });
  });

  test('still throws for a nonexistent field given with the full dotted name', async () => {
    await esInstance.initialize();
    const gqlFilter = { nested: { path: 'visits', '>=': { 'visits.no_such_field': 1 } } };
    expect(() => getFilterObj(esInstance, esIndex, gqlFilter)).toThrow(GraphQLError);
  });

  test('could skip the aggregated nested field if filterSelf=false, full dotted field name', async () => {
    await esInstance.initialize();
    const gqlFilter = {
      nested: { path: 'visits', '>=': { 'visits.days_to_visit': 10 } },
    };
    // aggregation field given as dotted or relative to the nested path
    expect(getFilterObj(esInstance, esIndex, gqlFilter, 'visits.days_to_visit', false)).toBeNull();
    expect(getFilterObj(esInstance, esIndex, gqlFilter, 'days_to_visit', false)).toBeNull();
  });
});
