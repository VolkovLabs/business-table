import { createTheme, dateTime, Field, FieldType, isDateTime, ReducerID, toDataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { ColumnDef, createTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel } from '@tanstack/react-table';

import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue, NumberFilterOperator } from '@/types';

import {
  columnFilter,
  convertTableToDataFrame,
  getFilterWithNewType,
  getFooterCell,
  getSupportedFilterTypesForVariable,
  getVariableColumnFilters,
  mergeColumnFilters,
} from './table';
import {
  createColumnConfig,
  createColumnMeta,
  createField,
  createVariable,
  dataFrameToObjectArray,
  FooterContext,
} from './test';

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

    /**
     * Hide console warning for dateTime if invalid input
     */
    jest.spyOn(global.console, 'warn');
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
          meta: createColumnMeta({
            availableFilterTypes: [ColumnFilterType.SEARCH],
            filterVariableName: variable.name,
            filterMode: ColumnFilterMode.QUERY,
          }),
        },
        {
          id: 'faceted',
          enableColumnFilter: true,
          meta: createColumnMeta({
            availableFilterTypes: [ColumnFilterType.FACETED],
            filterVariableName: variable2.name,
            filterMode: ColumnFilterMode.QUERY,
          }),
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
          meta: createColumnMeta({
            availableFilterTypes: [ColumnFilterType.SEARCH],
            filterVariableName: variable.name,
            filterMode: ColumnFilterMode.QUERY,
          }),
        },
        {
          id: 'clientName',
          enableColumnFilter: true,
          meta: createColumnMeta({
            availableFilterTypes: [ColumnFilterType.SEARCH],
            filterVariableName: variable.name,
            filterMode: ColumnFilterMode.CLIENT,
          }),
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

  describe('getSupportedFilterTypesForVariable', () => {
    it('Should enable faceted filter for multi query variable', () => {
      expect(
        getSupportedFilterTypesForVariable(
          createVariable({
            type: 'query',
            multi: true,
          } as never)
        )
      ).toEqual([ColumnFilterType.FACETED]);
      expect(
        getSupportedFilterTypesForVariable(
          createVariable({
            type: 'query',
            multi: false,
          } as never)
        )
      ).toEqual([]);
    });

    it('Should enable faceted filter for multi custom variable', () => {
      expect(
        getSupportedFilterTypesForVariable(
          createVariable({
            type: 'custom',
            multi: true,
          } as never)
        )
      ).toEqual([ColumnFilterType.FACETED]);
      expect(
        getSupportedFilterTypesForVariable(
          createVariable({
            type: 'custom',
            multi: false,
          } as never)
        )
      ).toEqual([]);
    });

    it('Should enable search filter for textbox variable', () => {
      expect(
        getSupportedFilterTypesForVariable(
          createVariable({
            type: 'textbox',
          })
        )
      ).toEqual([ColumnFilterType.SEARCH]);
    });

    it('Should enable search filter for constant variable', () => {
      expect(
        getSupportedFilterTypesForVariable(
          createVariable({
            type: 'constant',
          })
        )
      ).toEqual([ColumnFilterType.SEARCH]);
    });

    it('Should not enable filters if not supported variable', () => {
      expect(
        getSupportedFilterTypesForVariable(
          createVariable({
            type: 'datasource',
          })
        )
      ).toEqual([]);
      expect(
        getSupportedFilterTypesForVariable(
          createVariable({
            type: 'adhoc',
          })
        )
      ).toEqual([]);
      expect(
        getSupportedFilterTypesForVariable(
          createVariable({
            type: 'interval',
          })
        )
      ).toEqual([]);
      expect(
        getSupportedFilterTypesForVariable(
          createVariable({
            type: 'system',
          })
        )
      ).toEqual([]);
    });
  });

  describe('getFilterWithNewType', () => {
    it('Should return new number filter', () => {
      expect(getFilterWithNewType(ColumnFilterType.NUMBER)).toEqual({
        type: ColumnFilterType.NUMBER,
        value: [0, 0],
        operator: NumberFilterOperator.MORE,
      });
    });

    it('Should return new search filter', () => {
      expect(getFilterWithNewType(ColumnFilterType.SEARCH)).toEqual({
        type: ColumnFilterType.SEARCH,
        value: '',
        caseSensitive: false,
      });
    });

    it('Should return new faceted filter', () => {
      expect(getFilterWithNewType(ColumnFilterType.FACETED)).toEqual({
        type: ColumnFilterType.FACETED,
        value: [],
      });
    });

    it('Should return new timestamp filter', () => {
      const filter = getFilterWithNewType(ColumnFilterType.TIMESTAMP);

      expect(filter.type).toEqual(ColumnFilterType.TIMESTAMP);

      if (filter.type === ColumnFilterType.TIMESTAMP) {
        expect(isDateTime(filter.value.from)).toBeTruthy();
        expect(filter.value.from.isValid()).toBeFalsy();

        expect(isDateTime(filter.value.to)).toBeTruthy();
        expect(filter.value.to.isValid()).toBeFalsy();
      }
    });

    it('Should work if none filter', () => {
      expect(getFilterWithNewType('none')).toEqual({
        type: 'none',
      });
    });
  });

  describe('columnFilter', () => {
    interface ColumnFilterTestParams {
      name: string;
      columnId: string;
      value: unknown;
      filter: ColumnFilterValue;
      included: boolean;
    }

    /**
     * Create Column Filter
     */
    const createColumnFilter = (filterValue: Partial<ColumnFilterValue>): ColumnFilterValue => {
      return {
        ...getFilterWithNewType(filterValue.type || 'none'),
        ...filterValue,
      } as never;
    };
    /**
     * Run Column Filter Test
     */
    const runColumnFilterTest = (params: ColumnFilterTestParams) => {
      const row = {
        getValue: (columnId: string) => {
          if (params.columnId === columnId) {
            return params.value;
          }

          /**
           * Check if filter try to get access to unknown columnId
           */
          throw new Error('unknown column id');
        },
      };

      /**
       * Resolve filter value
       */
      const filterValue = columnFilter.resolveFilterValue(params.filter as never);

      const isIncluded = columnFilter(row as never, params.columnId, filterValue, jest.fn());

      expect(isIncluded).toEqual(params.included);
    };

    describe('search', () => {
      const tests: ColumnFilterTestParams[] = [
        {
          name: 'Should include value if includes string',
          value: 'Hello',
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.SEARCH,
            value: 'He',
          }),
          included: true,
        },
        {
          name: 'Should include value if includes string and case insensitive',
          value: 'Hello',
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.SEARCH,
            value: 'he',
            caseSensitive: false,
          }),
          included: true,
        },
        {
          name: 'Should exclude value if not includes string',
          value: 'Hello',
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.SEARCH,
            value: '123',
          }),
          included: false,
        },
        {
          name: 'Should include value if includes string and matches case',
          value: 'Hello',
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.SEARCH,
            value: 'He',
            caseSensitive: true,
          }),
          included: true,
        },
        {
          name: 'Should exclude value if includes string and not matches case',
          value: 'Hello',
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.SEARCH,
            value: 'he',
            caseSensitive: true,
          }),
          included: false,
        },
      ];

      it.each(tests)('$name', runColumnFilterTest);
    });

    describe('number', () => {
      const tests: ColumnFilterTestParams[] = [
        {
          name: 'Should include value if more',
          value: 11,
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.NUMBER,
            value: [10, 0],
            operator: NumberFilterOperator.MORE,
          }),
          included: true,
        },
        {
          name: 'Should include value if more or equal',
          value: 10,
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.NUMBER,
            value: [10, 0],
            operator: NumberFilterOperator.MORE_OR_EQUAL,
          }),
          included: true,
        },
        {
          name: 'Should include value if less',
          value: 9,
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.NUMBER,
            value: [10, 0],
            operator: NumberFilterOperator.LESS,
          }),
          included: true,
        },
        {
          name: 'Should include value if less or equal',
          value: 10,
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.NUMBER,
            value: [10, 0],
            operator: NumberFilterOperator.LESS_OR_EQUAL,
          }),
          included: true,
        },
        {
          name: 'Should include value if equal',
          value: 10,
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.NUMBER,
            value: [10, 0],
            operator: NumberFilterOperator.EQUAL,
          }),
          included: true,
        },
        {
          name: 'Should include value if not equal',
          value: 9,
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.NUMBER,
            value: [10, 0],
            operator: NumberFilterOperator.NOT_EQUAL,
          }),
          included: true,
        },
        {
          name: 'Should include value if between',
          value: 11,
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.NUMBER,
            value: [10, 12],
            operator: NumberFilterOperator.BETWEEN,
          }),
          included: true,
        },
        {
          name: 'Should exclude value if out of range',
          value: 14,
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.NUMBER,
            value: [10, 12],
            operator: NumberFilterOperator.BETWEEN,
          }),
          included: false,
        },
        {
          name: 'Should exclude value if unknown operator',
          value: 14,
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.NUMBER,
            value: [10, 12],
            operator: 'abc' as never,
          }),
          included: false,
        },
      ];

      it.each(tests)('$name', runColumnFilterTest);
    });

    describe('faceted', () => {
      const tests: ColumnFilterTestParams[] = [
        {
          name: 'Should include value if one of options',
          value: 'active',
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.FACETED,
            value: ['active', 'pending'],
          }),
          included: true,
        },
        {
          name: 'Should exclude value if none of options',
          value: 'deleted',
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.FACETED,
            value: ['active', 'pending'],
          }),
          included: false,
        },
        {
          name: 'Should exclude value if no available options',
          value: 'deleted',
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.FACETED,
            value: [],
          }),
          included: false,
        },
      ];

      it.each(tests)('$name', runColumnFilterTest);
    });

    describe('timestamp', () => {
      const date = dateTime('2022-02-02 10:00:00');

      const tests: ColumnFilterTestParams[] = [
        {
          name: 'Should include timestamp value if in range',
          value: date.valueOf(),
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.TIMESTAMP,
            value: {
              from: dateTime(date).subtract(1, 'day'),
              to: dateTime(date).add('1', 'day'),
              raw: {
                from: date,
                to: date,
              },
            },
          }),
          included: true,
        },
        {
          name: 'Should exclude timestamp value if out of range',
          value: date.valueOf(),
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.TIMESTAMP,
            value: {
              from: dateTime(date).add(1, 'day'),
              to: dateTime(date).add('1', 'day'),
              raw: {
                from: date,
                to: date,
              },
            },
          }),
          included: false,
        },
        {
          name: 'Should include date string value if in range',
          value: date.toISOString(),
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.TIMESTAMP,
            value: {
              from: dateTime(date).subtract(1, 'day'),
              to: dateTime(date).add('1', 'day'),
              raw: {
                from: date,
                to: date,
              },
            },
          }),
          included: true,
        },
        {
          name: 'Should exclude date string value if out of range',
          value: date.toISOString(),
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.TIMESTAMP,
            value: {
              from: dateTime(date).add(1, 'day'),
              to: dateTime(date).add('1', 'day'),
              raw: {
                from: date,
                to: date,
              },
            },
          }),
          included: false,
        },
        {
          name: 'Should include if invalid date string value',
          value: 'abc',
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.TIMESTAMP,
            value: {
              from: dateTime(date).subtract(1, 'day'),
              to: dateTime(date).add('1', 'day'),
              raw: {
                from: date,
                to: date,
              },
            },
          }),
          included: true,
        },
        {
          name: 'Should include if invalid value type',
          value: [123],
          columnId: 'message',
          filter: createColumnFilter({
            type: ColumnFilterType.TIMESTAMP,
            value: {
              from: dateTime(date).subtract(1, 'day'),
              to: dateTime(date).add('1', 'day'),
              raw: {
                from: date,
                to: date,
              },
            },
          }),
          included: true,
        },
      ];

      it.each(tests)('$name', runColumnFilterTest);
    });

    describe('none', () => {
      const tests: ColumnFilterTestParams[] = [
        {
          name: 'Should include value if unknown filter',
          value: 'active',
          columnId: 'message',
          filter: createColumnFilter({
            type: 'none',
          }),
          included: true,
        },
      ];

      it.each(tests)('$name', runColumnFilterTest);
    });
  });

  describe('getFooterCell', () => {
    /**
     * Theme
     */
    const theme = createTheme();

    /**
     * Field
     */
    const field = createField({
      name: 'value',
      values: [10, 15, 20],
      config: {
        unit: 'cm',
      },
    });

    it('Should work if no footer', () => {
      const context = new FooterContext(field.name).setRows(
        field.values.map((value) => ({
          [field.name]: value,
        }))
      );

      expect(
        getFooterCell({
          theme,
          context: context as never,
          config: createColumnConfig({
            field: {
              name: 'value',
              source: 0,
            },
            footer: [],
          }),
          field,
        })
      ).toEqual('');
    });

    it('Should find min within filtered values', () => {
      const context = new FooterContext(field.name).setRows(
        field.values.slice(1).map((value) => ({
          [field.name]: value,
        }))
      );

      expect(
        getFooterCell({
          theme,
          context: context as never,
          config: createColumnConfig({
            field: {
              name: 'value',
              source: 0,
            },
            footer: [ReducerID.min],
          }),
          field,
        })
      ).toEqual('15 cm');
    });

    it('Should return min value with units', () => {
      const context = new FooterContext(field.name).setRows(
        field.values.map((value) => ({
          [field.name]: value,
        }))
      );

      expect(
        getFooterCell({
          theme,
          context: context as never,
          config: createColumnConfig({
            field: {
              name: 'value',
              source: 0,
            },
            footer: [ReducerID.min],
          }),
          field,
        })
      ).toEqual('10 cm');
    });

    it('Should not preserve units', () => {
      const context = new FooterContext(field.name).setRows(
        field.values.map((value) => ({
          [field.name]: value,
        }))
      );

      expect(
        getFooterCell({
          theme,
          context: context as never,
          config: createColumnConfig({
            field: {
              name: 'value',
              source: 0,
            },
            footer: [ReducerID.changeCount],
          }),
          field,
        })
      ).toEqual('2');
    });

    it('Should work if no display processor', () => {
      const context = new FooterContext(field.name).setRows(
        field.values.map((value) => ({
          [field.name]: value,
        }))
      );

      expect(
        getFooterCell({
          theme,
          context: context as never,
          config: createColumnConfig({
            field: {
              name: 'value',
              source: 0,
            },
            footer: [ReducerID.min],
          }),
          field: {
            name: 'value',
            values: [10, 15, 20],
          } as never,
        })
      ).toEqual('10');
    });
  });

  describe('convertTableToDataFrame', () => {
    /**
     * Frame
     */
    const nameField: Field = {
      name: 'name',
      config: {
        displayName: 'Name',
      },
      type: FieldType.string,
      values: ['device1', 'device2'],
    };
    const valueField = {
      name: 'value',
      config: {},
      type: FieldType.number,
      values: [10, 20],
    };
    const frame = toDataFrame({
      fields: [nameField, valueField],
    });

    /**
     * Data
     */
    const data = dataFrameToObjectArray(frame);

    it('Should use existing fields with config', () => {
      const columns: Array<ColumnDef<(typeof data)[0]>> = [
        {
          id: 'name',
          accessorKey: 'name',
          meta: createColumnMeta({
            field: frame.fields[0],
          }),
        },
        {
          id: 'value',
          accessorKey: 'value',
          meta: createColumnMeta({
            field: frame.fields[1],
          }),
        },
      ];

      const table = createTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableFilters: true,
        enableSorting: true,
        onStateChange: () => null,
        renderFallbackValue: () => null,
        state: {
          columnPinning: {
            left: [],
            right: [],
          },
          columnFilters: [],
          sorting: [],
        },
      });

      const result = convertTableToDataFrame(table);

      expect(result.fields[0]).toEqual({
        ...nameField,
        values: nameField.values,
      });
      expect(result.fields[1]).toEqual({
        ...valueField,
        values: valueField.values,
      });
    });

    it('Should work if no field', () => {
      const columns: Array<ColumnDef<(typeof data)[0]>> = [
        {
          id: 'name',
          accessorKey: 'name',
          meta: createColumnMeta({
            field: null as never,
          }),
        },
        {
          id: 'value',
          accessorKey: 'value',
          meta: createColumnMeta({
            field: frame.fields[1],
          }),
        },
      ];

      const table = createTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableFilters: true,
        enableSorting: true,
        onStateChange: () => null,
        renderFallbackValue: () => null,
        state: {
          columnPinning: {
            left: [],
            right: [],
          },
          columnFilters: [],
          sorting: [],
        },
      });

      const result = convertTableToDataFrame(table);

      expect(result.fields[0]).toEqual({
        type: FieldType.other,
        name: 'name',
        config: {},
        values: nameField.values,
      });
      expect(result.fields[1]).toEqual({
        ...valueField,
        values: valueField.values,
      });
    });

    it('Should move pinned fields to the start', () => {
      const columns: Array<ColumnDef<(typeof data)[0]>> = [
        {
          id: 'name',
          accessorKey: 'name',
          meta: createColumnMeta({
            field: frame.fields[0],
          }),
        },
        {
          id: 'value',
          accessorKey: 'value',
          meta: createColumnMeta({
            field: frame.fields[1],
          }),
          enablePinning: true,
        },
      ];

      const table = createTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableFilters: true,
        enableSorting: true,
        onStateChange: () => null,
        renderFallbackValue: () => null,
        state: {
          columnPinning: {
            left: [columns[1].id || ''],
            right: [],
          },
          columnFilters: [],
          sorting: [],
        },
      });

      const result = convertTableToDataFrame(table);

      expect(result.fields[0]).toEqual({
        ...valueField,
        values: valueField.values,
      });
      expect(result.fields[1]).toEqual({
        ...nameField,
        values: nameField.values,
      });
    });

    it('Should add only filtered data', () => {
      const columns: Array<ColumnDef<(typeof data)[0]>> = [
        {
          id: 'name',
          accessorKey: 'name',
          meta: createColumnMeta({
            field: frame.fields[0],
          }),
        },
        {
          id: 'value',
          accessorKey: 'value',
          meta: createColumnMeta({
            availableFilterTypes: [ColumnFilterType.NUMBER],
            filterMode: ColumnFilterMode.CLIENT,
            field: frame.fields[1],
          }),
          filterFn: columnFilter,
        },
      ];

      const table = createTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableFilters: true,
        enableSorting: true,
        onStateChange: () => null,
        renderFallbackValue: () => null,
        state: {
          columnPinning: {
            left: [],
            right: [],
          },
          columnFilters: [
            { id: columns[1].id || '', value: { type: ColumnFilterType.NUMBER, value: [10, 0], operator: '>' } },
          ],
          sorting: [],
        },
      });

      const result = convertTableToDataFrame(table);

      expect(result.fields[0]).toEqual({
        ...nameField,
        values: [nameField.values[1]],
      });
      expect(result.fields[1]).toEqual({
        ...valueField,
        values: [valueField.values[1]],
      });
    });

    it('Should add sorted data', () => {
      const columns: Array<ColumnDef<(typeof data)[0]>> = [
        {
          id: 'name',
          accessorKey: 'name',
          meta: createColumnMeta({
            field: frame.fields[0],
          }),
        },
        {
          id: 'value',
          accessorKey: 'value',
          meta: createColumnMeta({
            field: frame.fields[1],
          }),
        },
      ];

      const table = createTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableFilters: true,
        enableSorting: true,
        onStateChange: () => null,
        renderFallbackValue: () => null,
        state: {
          columnPinning: {
            left: [],
            right: [],
          },
          columnFilters: [],
          sorting: [{ id: columns[1].id || '', desc: true }],
        },
      });

      const result = convertTableToDataFrame(table);

      expect(result.fields[0]).toEqual({
        ...nameField,
        values: [nameField.values[1], nameField.values[0]],
      });
      expect(result.fields[1]).toEqual({
        ...valueField,
        values: [valueField.values[1], valueField.values[0]],
      });
    });

    it('Should add calculated values in the end if footer enabled', () => {
      const columns: Array<ColumnDef<(typeof data)[0]>> = [
        {
          id: 'name',
          accessorKey: 'name',
          meta: createColumnMeta({
            field: frame.fields[0],
          }),
        },
        {
          id: 'value',
          accessorKey: 'value',
          meta: createColumnMeta({
            config: createColumnConfig({
              footer: ['sum'],
            }),
            field: frame.fields[1],
            footerEnabled: true,
          }),
          enablePinning: true,
        },
      ];

      const table = createTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableFilters: true,
        enableSorting: true,
        onStateChange: () => null,
        renderFallbackValue: () => null,
        state: {
          columnPinning: {
            left: [],
            right: [],
          },
          columnFilters: [],
          sorting: [],
        },
      });

      const result = convertTableToDataFrame(table);

      expect(result.fields[0]).toEqual({
        ...nameField,
        values: [...nameField.values, null],
      });
      expect(result.fields[1]).toEqual({
        ...valueField,
        values: [...valueField.values, 30],
      });
    });
  });
});
