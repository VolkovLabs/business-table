import { FieldType, toDataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { renderHook } from '@testing-library/react';

import { CellAggregation, ColumnFilterMode, ColumnFilterType } from '@/types';
import { columnFilter, createColumnConfig, createVariable } from '@/utils';

import { useTable } from './useTable';

describe('useTable', () => {
  /**
   * Frame
   */
  const refId = 'A';
  const frame = toDataFrame({
    refId,
    fields: [
      {
        name: 'device',
        values: ['device1', 'device2'],
      },
      {
        name: 'value',
        values: [10, 20],
      },
      {
        name: 'created',
        type: FieldType.time,
        values: [new Date().valueOf(), new Date().valueOf()],
      },
      {
        name: 'other',
        type: FieldType.other,
        values: ['a', 'b'],
      },
      {
        name: 'unused',
        values: [11, 22],
      },
    ],
  });

  it('Should return table data for configured columns', () => {
    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [
          createColumnConfig({
            field: {
              source: refId,
              name: 'device',
            },
          }),
          createColumnConfig({
            field: {
              source: refId,
              name: 'value',
            },
          }),
        ],
      })
    );

    expect(result.current.tableData).toEqual([
      {
        device: frame.fields[0].values[0],
        value: frame.fields[1].values[0],
      },
      {
        device: frame.fields[0].values[1],
        value: frame.fields[1].values[1],
      },
    ]);
  });

  it('Should return table data if no refId', () => {
    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [
            {
              ...frame,
              refId: undefined,
            },
          ],
        } as any,
        columns: [
          createColumnConfig({
            field: {
              source: 0,
              name: 'device',
            },
          }),
          createColumnConfig({
            field: {
              source: 0,
              name: 'value',
            },
          }),
        ],
      })
    );

    expect(result.current.tableData).toEqual([
      {
        device: frame.fields[0].values[0],
        value: frame.fields[1].values[0],
      },
      {
        device: frame.fields[0].values[1],
        value: frame.fields[1].values[1],
      },
    ]);
  });

  it('Should work if no data frame', () => {
    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [],
        } as any,
        columns: [
          createColumnConfig({
            field: {
              source: refId,
              name: 'device',
            },
          }),
          createColumnConfig({
            field: {
              source: refId,
              name: 'value',
            },
          }),
        ],
      })
    );

    expect(result.current.tableData).toEqual([]);
  });

  it('Should work if no columns', () => {
    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [],
      })
    );

    expect(result.current.tableData).toEqual([]);
  });

  it('Should return columns from config', () => {
    const deviceColumn = createColumnConfig({
      label: 'Device',
      field: {
        source: refId,
        name: 'device',
      },
      item: true,
      aggregation: CellAggregation.UNIQUE_COUNT,
    });
    const valueColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'value',
      },
      item: false,
      aggregation: CellAggregation.NONE,
    });

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn, valueColumn],
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        accessorKey: deviceColumn.field.name,
        header: deviceColumn.label,
        cell: expect.any(Function),
        enableGrouping: deviceColumn.group,
        aggregationFn: deviceColumn.aggregation,
      }),
      expect.objectContaining({
        id: valueColumn.field.name,
        accessorKey: valueColumn.field.name,
        header: frame.fields[1].name,
        cell: expect.any(Function),
        enableGrouping: valueColumn.group,
        aggregationFn: expect.any(Function),
      }),
    ]);

    /**
     * Check if none aggregation returns nothing
     */
    expect((result.current.columns[1].aggregationFn as () => null)()).toBeNull();
  });

  it('Should build client column filters', () => {
    const deviceColumn = createColumnConfig({
      label: 'Device',
      field: {
        source: refId,
        name: 'device',
      },
      filter: {
        enabled: true,
        mode: ColumnFilterMode.CLIENT,
        variable: '',
      },
    });
    const valueColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'value',
      },
      filter: {
        enabled: true,
        mode: ColumnFilterMode.CLIENT,
        variable: '',
      },
    });
    const createdColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'created',
      },
      filter: {
        enabled: true,
        mode: ColumnFilterMode.CLIENT,
        variable: '',
      },
    });
    const otherColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'other',
      },
      filter: {
        enabled: true,
        mode: ColumnFilterMode.CLIENT,
        variable: '',
      },
    });

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn, valueColumn, createdColumn, otherColumn],
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        enableColumnFilter: true,
        filterFn: columnFilter,
        meta: {
          availableFilterTypes: [ColumnFilterType.SEARCH, ColumnFilterType.FACETED],
          filterMode: deviceColumn.filter.mode,
          filterVariableName: deviceColumn.filter.variable,
        },
      }),
      expect.objectContaining({
        id: valueColumn.field.name,
        enableColumnFilter: true,
        filterFn: expect.any(Function),
        meta: {
          availableFilterTypes: [ColumnFilterType.NUMBER],
          filterMode: valueColumn.filter.mode,
          filterVariableName: valueColumn.filter.variable,
        },
      }),
      expect.objectContaining({
        id: createdColumn.field.name,
        enableColumnFilter: true,
        filterFn: expect.any(Function),
        meta: {
          availableFilterTypes: [ColumnFilterType.TIMESTAMP],
          filterMode: createdColumn.filter.mode,
          filterVariableName: createdColumn.filter.variable,
        },
      }),
      expect.objectContaining({
        id: otherColumn.field.name,
        enableColumnFilter: true,
        filterFn: expect.any(Function),
        meta: {
          availableFilterTypes: [ColumnFilterType.SEARCH, ColumnFilterType.FACETED],
          filterMode: createdColumn.filter.mode,
          filterVariableName: createdColumn.filter.variable,
        },
      }),
    ]);

    /**
     * Check if none aggregation returns nothing
     */
    expect((result.current.columns[1].aggregationFn as () => null)()).toBeNull();
  });

  it('Should build query column filters', () => {
    const deviceColumn = createColumnConfig({
      label: 'Device',
      field: {
        source: refId,
        name: 'device',
      },
      filter: {
        enabled: true,
        mode: ColumnFilterMode.QUERY,
        variable: 'deviceVar',
      },
    });

    /**
     * Mock variables
     */
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([
      createVariable({
        name: deviceColumn.filter.variable,
        type: 'query',
        multi: true,
      } as never),
    ]);

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn],
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        enableColumnFilter: true,
        filterFn: expect.any(Function),
        meta: {
          availableFilterTypes: [ColumnFilterType.FACETED],
          filterMode: deviceColumn.filter.mode,
          filterVariableName: deviceColumn.filter.variable,
        },
      }),
    ]);

    /**
     * Check if filter function always include value
     */
    expect((result.current.columns[0].filterFn as any)()).toBeTruthy();
  });

  it('Should build column sort', () => {
    const deviceColumn = createColumnConfig({
      label: 'Device',
      field: {
        source: refId,
        name: 'device',
      },
      sort: {
        enabled: true,
      },
    });
    const valueColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'value',
      },
      sort: {
        enabled: false,
      },
    });

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn, valueColumn],
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        enableSorting: true,
      }),
      expect.objectContaining({
        id: valueColumn.field.name,
        enableSorting: false,
      }),
    ]);
  });
});
