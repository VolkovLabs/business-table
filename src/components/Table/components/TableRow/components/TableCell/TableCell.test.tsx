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
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React, { act } from 'react';

import { nestedObjectEditorsRegistry } from '@/components';
import { TEST_IDS } from '@/constants';
import { CellAggregation, CellType, NestedObjectType } from '@/types';
import {
  createColumnAccessorFn,
  createColumnConfig,
  createColumnMeta,
  createDataLink,
  createField,
  createNestedObjectConfig,
} from '@/utils';

import { TableCell } from './TableCell';

/**
 * Mock nestedObjectEditorsRegistry
 */
jest.mock('@/components/editors/NestedObjectsEditor', () => ({
  nestedObjectEditorsRegistry: {
    get: jest.fn(),
  },
}));

/**
 * Table cell
 */
describe('TableCell', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.tableCell);
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
   * onOuterClick for test stopPropagation()
   */
  const onOuterClick = jest.fn();

  /**
   * Wrapper
   */
  const Wrapper = ({
    data,
    columns,
    grouping = defaultGrouping,
    expanded = defaultExpanded,
    columnPinning = defaultColumnPinning,
  }: {
    data: unknown[];
    columns: Array<ColumnDef<any>>;
    rowIndex: number;
    grouping?: GroupingState;
    expanded?: ExpandedState;
    editingRowIndex?: number;
    columnPinning?: ColumnPinningState;
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

    /**
     * Rows
     */
    const { rows } = table.getRowModel();

    /**
     * Visible cells
     */
    const visibleCells: any = rows[0].getVisibleCells();

    /**
     * rendererProps
     */
    const rendererProps = {
      ...visibleCells[0].getContext(),
      bgColor: '#fff',
      isEditing: false,
    } as any;

    return (
      <div onClick={onOuterClick}>
        <TableCell rendererProps={rendererProps} cell={visibleCells[0]} row={rows[0]} />
      </div>
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
  }) => {
    return <Wrapper {...props} />;
  };

  it('Should render one link ', async () => {
    const data = [
      {
        value: 'abc',
        name: 'device1',
      },
    ];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          field: createField({
            getLinks: () => [
              createDataLink({
                href: 'https://test.com',
                target: '_blank',
                title: 'test-url',
              }),
            ],
          }),
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
        })
      )
    );
    expect(selectors.tableLink(false, 'test-url')).toBeInTheDocument();
  });

  it('Should render more than one links', async () => {
    const data = [
      {
        value: 'abc',
        name: 'device1',
      },
    ];
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          field: createField({
            getLinks: () => [
              createDataLink({
                href: 'https://test.com',
                target: '_blank',
                title: 'test-url',
              }),
              createDataLink({
                href: 'https://test2.com',
                target: '_blank',
                title: 'test-url-2',
              }),
            ],
          }),
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
        })
      )
    );

    expect(selectors.tableLinkMenu()).toBeInTheDocument();

    expect(selectors.tableLink(true, 'test-url')).not.toBeInTheDocument();
    expect(selectors.tableLink(true, 'test-url-2')).not.toBeInTheDocument();

    /**
     * Open links dropdown
     */
    fireEvent.click(selectors.tableLinkMenu());
    expect(onOuterClick).not.toHaveBeenCalled();

    /**
     * Check links dropdown presence
     */
    expect(selectors.tableLink(false, 'test-url')).toBeInTheDocument();
    expect(selectors.tableLink(false, 'test-url-2')).toBeInTheDocument();
  });

  it('Should render nested objects', async () => {
    const data = [
      {
        comments: [{ id: 1, title: 'my title' }],
      },
    ];

    const nestedObject = createNestedObjectConfig({
      id: '123',
      type: NestedObjectType.CARDS,
    });

    const columns = [
      {
        id: 'comments',
        accessorFn: createColumnAccessorFn('comments'),
        meta: createColumnMeta({
          config: createColumnConfig({
            type: CellType.NESTED_OBJECTS,
            objectId: nestedObject.id,
          }),
          nestedObjectOptions: {} as any,
        }),
      },
    ];

    const controlMock = jest.fn(() => null);

    jest.mocked(nestedObjectEditorsRegistry.get).mockReturnValue({
      control: controlMock,
    } as any);

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
        })
      )
    );

    expect(controlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        value: [{ id: 1, title: 'my title' }],
      }),
      expect.anything()
    );
  });

  it('Should render totalSubRows', async () => {
    const data = [
      {
        device: 'device1',
        value: 10,
      },
      {
        device: 'device2',
        value: 20,
      },
    ];

    const columns = [
      {
        id: 'device',
        accessorFn: createColumnAccessorFn('device'),
        enableGrouping: true,
        meta: createColumnMeta({
          config: createColumnConfig({
            aggregation: CellAggregation.COUNT,
          }),
        }),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        aggregationFn: () => null,
      },
    ];

    await act(async () =>
      render(
        getComponent({
          data,
          columns,
          rowIndex: 0,
          grouping: ['device'],
        })
      )
    );

    expect(selectors.totalSubRows()).toBeInTheDocument();
    expect(selectors.totalSubRows()).toHaveTextContent('(1)');
  });
});
