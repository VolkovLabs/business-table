import { toDataFrame } from '@grafana/data';
import { renderHook } from '@testing-library/react';
import { CellAggregation } from '../types';
import { createColumnConfig } from '../utils';
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

  it('Should returns columns from config', () => {
    const deviceColumn = createColumnConfig({
      label: 'Device',
      field: {
        source: refId,
        name: 'device',
      },
      group: true,
      aggregation: CellAggregation.UNIQUE_COUNT,
    });
    const valueColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'value',
      },
      group: false,
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
      {
        id: deviceColumn.field.name,
        accessorKey: deviceColumn.field.name,
        header: deviceColumn.label,
        cell: expect.any(Function),
        enableGrouping: deviceColumn.group,
        aggregationFn: deviceColumn.aggregation,
      },
      {
        id: valueColumn.field.name,
        accessorKey: valueColumn.field.name,
        header: frame.fields[1].name,
        cell: expect.any(Function),
        enableGrouping: valueColumn.group,
        aggregationFn: expect.any(Function),
      },
    ]);

    /**
     * Check if none aggregation returns nothing
     */
    expect((result.current.columns[1].aggregationFn as Function)()).toBeNull();
  });
});
