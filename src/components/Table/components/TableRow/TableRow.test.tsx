import { createTheme, ThresholdsMode } from '@grafana/data';
import {
  ColumnDef,
  ColumnPinningState,
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  GroupingState,
  useReactTable,
} from '@tanstack/react-table';
import { act, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { CellAggregation, CellType, ColumnEditorType } from '@/types';
import {
  createColumnAccessorFn,
  createColumnAppearanceConfig,
  createColumnConfig,
  createColumnMeta,
  createField,
} from '@/utils';

import { TableRow, testIds } from './TableRow';

describe('TableRow', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(testIds);
  const selectors = getSelectors(screen);

  /**
   * Fallbacks
   */
  const defaultGrouping: GroupingState = [];
  const defaultExpanded: ExpandedState = {};
  const defaultColumnPinning: ColumnPinningState = {
    left: [],
    right: [],
  };

  /**
   * Wrapper
   */
  const Wrapper = ({
    data,
    columns,
    rowIndex,
    grouping = defaultGrouping,
    expanded = defaultExpanded,
    editingRowIndex,
    columnPinning = defaultColumnPinning,
    isNewRow,
  }: {
    data: unknown[];
    columns: Array<ColumnDef<any>>;
    rowIndex: number;
    grouping?: GroupingState;
    expanded?: ExpandedState;
    editingRowIndex?: number;
    columnPinning?: ColumnPinningState;
    isNewRow?: boolean;
  }) => {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
      enableGrouping: true,
      enableExpanding: true,
      getExpandedRowModel: getExpandedRowModel(),
      state: {
        grouping,
        expanded,
        columnPinning,
      },
    });

    const { rows } = table.getRowModel();

    return (
      <table>
        <tbody>
          <TableRow
            row={rows[rowIndex]}
            virtualRow={{ index: rowIndex, start: 0 } as any}
            rowVirtualizer={{ measureElement: jest.fn() } as any}
            editingRow={editingRowIndex !== undefined ? rows[editingRowIndex] : null}
            onStartEdit={jest.fn()}
            onCancelEdit={jest.fn()}
            onChange={jest.fn()}
            onSave={jest.fn()}
            isSaving={false}
            isEditRowEnabled={false}
            isNewRow={isNewRow}
            onDelete={jest.fn()}
            isHighlighted={false}
          />
        </tbody>
      </table>
    );
  };

  /**
   * Get Component
   */
  const getComponent = (props: {
    data: unknown[];
    columns: Array<ColumnDef<any>>;
    rowIndex: number;
    grouping?: GroupingState;
    expanded?: ExpandedState;
    editingRowIndex?: number;
    columnPinning?: ColumnPinningState;
    isNewRow?: boolean;
  }) => {
    return <Wrapper {...props} />;
  };

  it('Should render row with cells', async () => {
    const data = [{ value: 'abc', name: 'device1' }];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
        })
      )
    );

    expect(selectors.bodyRow(false, '0')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '0_name')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '0_value')).toBeInTheDocument();
  });

  it('Should render grouped row', async () => {
    const data = [
      { value: 'abc', name: 'device1' },
      { value: 'hello', name: 'device1' },
    ];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        enableGrouping: true,
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
          grouping: ['name'],
        })
      )
    );

    expect(selectors.bodyRow(false, 'name:device1')).toBeInTheDocument();
    expect(selectors.bodyCell(false, 'name:device1_name')).toBeInTheDocument();
    expect(selectors.buttonExpandCell(false, 'name:device1_name')).toBeInTheDocument();
  });

  it('Should render pinned columns', async () => {
    const data = [
      { value: 'abc', name: 'device1' },
      { value: 'hello', name: 'device1' },
    ];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        enablePinning: true,
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
          columnPinning: {
            left: ['name'],
          },
        })
      )
    );

    expect(selectors.bodyCell(false, '0_name')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '0_name')).toHaveStyle({
      position: 'sticky',
    });
    expect(selectors.bodyCell(false, '0_value')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '0_value')).not.toHaveStyle({
      position: 'sticky',
    });
  });

  it('Should render grouped expanded row', async () => {
    const data = [
      { value: 'abc', name: 'device1' },
      { value: 'hello', name: 'device1' },
    ];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        enableGrouping: true,
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
          grouping: ['name'],
          expanded: {
            'name:device1': true,
          },
        })
      )
    );

    expect(selectors.bodyRow(false, 'name:device1')).toBeInTheDocument();
    expect(selectors.bodyCell(false, 'name:device1_name')).toBeInTheDocument();
  });

  it('Should set cell background', async () => {
    const data = [{ value: 20, name: 'device1' }];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          config: createColumnConfig({
            type: CellType.COLORED_BACKGROUND,
          }),
          field: createField({
            name: 'name',
            values: [20],
            config: {
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  {
                    value: 0,
                    color: 'green',
                  },
                  {
                    value: 20,
                    color: 'orange',
                  },
                ],
              },
            },
          }),
        }),
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
        })
      )
    );

    const theme = createTheme();

    expect(selectors.bodyRow(false, '0')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '0_name')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '0_name')).toHaveStyle({
      'background-color': theme.visualization.getColorByName('orange'),
    });
  });

  it('Should set cell background for aggregated cell', async () => {
    const data = [
      { value: 20, name: 'device1' },
      { value: 60, name: 'device1' },
      { value: 10, name: 'device1' },
    ];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          config: createColumnConfig({
            type: CellType.COLORED_BACKGROUND,
            aggregation: CellAggregation.SUM,
          }),
          field: createField({
            name: 'name',
            values: [20],
            config: {
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  {
                    value: 0,
                    color: 'green',
                  },
                  {
                    value: 20,
                    color: 'orange',
                  },
                ],
              },
            },
          }),
        }),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          config: createColumnConfig({
            type: CellType.COLORED_BACKGROUND,
            aggregation: CellAggregation.SUM,
          }),
          field: createField({
            name: 'value',
            values: [20],
            config: {
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  {
                    value: 0,
                    color: 'green',
                  },
                  {
                    value: 20,
                    color: 'orange',
                  },
                ],
              },
            },
          }),
        }),
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
          grouping: ['name'],
        })
      )
    );

    const theme = createTheme();

    expect(selectors.bodyRow(false, 'name:device1')).toBeInTheDocument();
    expect(selectors.bodyCell(false, 'name:device1_value')).toBeInTheDocument();
    expect(selectors.bodyCell(false, 'name:device1_value')).toHaveStyle({
      'background-color': theme.visualization.getColorByName('orange'),
    });
  });

  it('Should not set cell background for aggregated cell if not acceptable type', async () => {
    const data = [
      { value: 20, name: 'device1' },
      { value: 60, name: 'device1' },
      { value: 10, name: 'device1' },
    ];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          config: createColumnConfig({
            type: CellType.COLORED_BACKGROUND,
            aggregation: CellAggregation.EXTENT,
          }),
          field: createField({
            name: 'name',
            values: [20],
            config: {
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  {
                    value: 0,
                    color: 'green',
                  },
                  {
                    value: 20,
                    color: 'orange',
                  },
                ],
              },
            },
          }),
        }),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          config: createColumnConfig({
            type: CellType.COLORED_BACKGROUND,
            aggregation: CellAggregation.EXTENT,
          }),
          field: createField({
            name: 'value',
            values: [20],
            config: {
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  {
                    value: 0,
                    color: 'green',
                  },
                  {
                    value: 20,
                    color: 'orange',
                  },
                ],
              },
            },
          }),
        }),
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
          grouping: ['name'],
        })
      )
    );

    expect(selectors.bodyRow(false, 'name:device1')).toBeInTheDocument();
    expect(selectors.bodyCell(false, 'name:device1_value')).toBeInTheDocument();
    expect(selectors.bodyCell(false, 'name:device1_value').style.color).toEqual('');
  });

  it('Should set row background if enabled', async () => {
    const data = [{ value: 20, name: 'device1' }];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          config: createColumnConfig({
            type: CellType.COLORED_BACKGROUND,
            appearance: createColumnAppearanceConfig({
              background: {
                applyToRow: true,
              },
            }),
          }),
          field: createField({
            name: 'name',
            values: [20],
            config: {
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  {
                    value: 0,
                    color: 'green',
                  },
                  {
                    value: 20,
                    color: 'orange',
                  },
                ],
              },
            },
          }),
        }),
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
        })
      )
    );

    const theme = createTheme();

    expect(selectors.bodyRow(false, '0')).toBeInTheDocument();
    expect(selectors.bodyRow(false, '0')).toHaveStyle({
      'background-color': theme.visualization.getColorByName('orange'),
    });
  });

  it('Should render editing row', async () => {
    const data = [{ value: 'abc', name: 'device1' }];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          editable: true,
          editor: {
            type: ColumnEditorType.STRING,
          },
        }),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
          editingRowIndex: 0,
        })
      )
    );

    expect(getJestSelectors(TEST_IDS.editableCell)(screen).fieldString()).toBeInTheDocument();
  });

  it('Should render editing new row', async () => {
    const data = [{ value: 'abc', name: 'device1' }];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          addRowEditable: true,
          addRowEditor: {
            type: ColumnEditorType.STRING,
          },
        }),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
          editingRowIndex: 0,
          isNewRow: true,
        })
      )
    );

    expect(getJestSelectors(TEST_IDS.editableCell)(screen).fieldString()).toBeInTheDocument();
  });
});
