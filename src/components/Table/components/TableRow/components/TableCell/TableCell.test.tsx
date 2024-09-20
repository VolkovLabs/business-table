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

import { TEST_IDS } from '@/constants';

import { TableCell } from './TableCell';

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
        accessorKey: 'name',
        meta: {
          field: {
            getLinks: jest.fn(() => [
              {
                href: 'https://test.com',
                target: '_blank',
                title: 'test-url',
              },
            ]),
          },
        },
      },
      {
        id: 'value',
        accessorKey: 'value',
      },
    ] as any;

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

  it('Should call stopPropagation on click', async () => {
    const data = [
      {
        value: 'abc',
        name: 'device1',
      },
    ];
    const columns = [
      {
        id: 'name',
        accessorKey: 'name',
        meta: {
          field: {
            getLinks: jest.fn(() => [
              {
                href: 'https://test.com',
                target: '_blank',
                title: 'test-url',
              },
            ]),
          },
        },
      },
      {
        id: 'value',
        accessorKey: 'value',
      },
    ] as any;

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

    /**
     * onOuterClick should not call if stopPropagation() works
     */
    fireEvent.click(selectors.tableLink(false, 'test-url'));
    expect(onOuterClick).toHaveBeenCalledTimes(0);
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
        accessorKey: 'name',
        meta: {
          field: {
            getLinks: jest.fn(() => [
              {
                href: 'https://test.com',
                target: '_blank',
                title: 'test-url',
              },
              {
                href: 'https://test2.com',
                target: '_blank',
                title: 'test-url-2',
              },
            ]),
          },
        },
      },
      {
        id: 'value',
        accessorKey: 'value',
      },
    ] as any;

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
     * onOuterClick should not call if stopPropagation() works when menu is open
     */
    fireEvent.click(selectors.tableLinkMenu());
    expect(onOuterClick).toHaveBeenCalledTimes(0);

    /**
     * Mock implementation on __mocks__ grafana for DataLinksContextMenuMock
     */
    expect(selectors.tableLink(false, 'test-url')).toBeInTheDocument();
    expect(selectors.tableLink(false, 'test-url-2')).toBeInTheDocument();
  });
});
