import { getTemplateSrv } from '@grafana/runtime';

import { ColumnFilterMode, ColumnFilterType } from '../types';
import { getVariableColumnFilters, mergeColumnFilters } from './table';
import { createVariable } from './test';

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  getTemplateSrv: jest.fn(),
}));

describe('Table utils', () => {
  const getVariablesMock = jest.fn();

  beforeEach(() => {
    jest.mocked(getTemplateSrv).mockReturnValue({
      getVariables: getVariablesMock.mockReturnValue([]),
    } as never);
  });

  describe('getVariableColumnFilters', () => {
    it('Should build filters for columns with variable', () => {
      const variable = createVariable({
        name: 'test',
        type: 'constant',
        current: {
          value: 'abc',
        },
      });
      const variable2 = createVariable({
        name: 'testMulti',
        type: 'query',
        current: {
          value: ['abc'],
        },
        multi: true,
      } as never);

      /**
       * Mock variables
       */
      getVariablesMock.mockReturnValue([variable, variable2]);

      const result = getVariableColumnFilters([
        {
          id: 'search',
          enableColumnFilter: true,
          meta: {
            availableFilterTypes: [ColumnFilterType.SEARCH],
            filterVariableName: variable.name,
            filterMode: ColumnFilterMode.QUERY,
          },
        },
        {
          id: 'faceted',
          enableColumnFilter: true,
          meta: {
            availableFilterTypes: [ColumnFilterType.FACETED],
            filterVariableName: variable2.name,
            filterMode: ColumnFilterMode.QUERY,
          },
        },
      ]);

      expect(result).toEqual([
        {
          id: 'search',
          value: {
            type: ColumnFilterType.SEARCH,
            value: 'abc',
            caseSensitive: false,
          },
        },
        {
          id: 'faceted',
          value: {
            type: ColumnFilterType.FACETED,
            value: ['abc'],
          },
        },
      ]);
    });

    it('Should include empty filters', () => {
      const variable = createVariable({
        name: 'test',
        type: 'constant',
        current: {
          value: '',
        },
      });

      /**
       * Mock variables
       */
      getVariablesMock.mockReturnValue([variable]);

      const result = getVariableColumnFilters([
        {
          id: 'queryName',
          enableColumnFilter: true,
          meta: {
            availableFilterTypes: [ColumnFilterType.SEARCH],
            filterVariableName: variable.name,
            filterMode: ColumnFilterMode.QUERY,
          },
        },
        {
          id: 'clientName',
          enableColumnFilter: true,
          meta: {
            availableFilterTypes: [ColumnFilterType.SEARCH],
            filterVariableName: variable.name,
            filterMode: ColumnFilterMode.CLIENT,
          },
        },
      ]);

      expect(result).toEqual([
        {
          id: 'queryName',
          value: undefined,
        },
      ]);
    });

    it('Should work if no columns', () => {
      expect(getVariableColumnFilters([])).toEqual([]);
    });
  });

  describe('mergeColumnFilters', () => {
    it('Should add new items', () => {
      const currentItems = [
        {
          id: '1',
          value: 1,
        },
      ];
      const itemsToOverride = [
        {
          id: '2',
          value: 2,
        },
      ];

      expect(mergeColumnFilters(currentItems, itemsToOverride)).toEqual([...currentItems, ...itemsToOverride]);
    });

    it('Should override existing items with new value', () => {
      const currentItems = [
        {
          id: '1',
          value: 1,
        },
        {
          id: '2',
          value: 2,
        },
      ];
      const itemsToOverride = [
        {
          id: '2',
          value: 'new',
        },
      ];

      expect(mergeColumnFilters(currentItems, itemsToOverride)).toEqual([currentItems[0], itemsToOverride[0]]);
    });

    it('Should remove existing items if new value not defined', () => {
      const currentItems = [
        {
          id: '1',
          value: 1,
        },
        {
          id: '2',
          value: 2,
        },
      ];
      const itemsToOverride = [
        {
          id: '2',
          value: undefined,
        },
      ];

      expect(mergeColumnFilters(currentItems, itemsToOverride)).toEqual([currentItems[0]]);
    });
  });
});
