import { EventBus, GrafanaTheme2 } from '@grafana/data';
import { Pagination, useStyles2, useTheme2 } from '@grafana/ui';
import {
  Column,
  ColumnDef,
  ColumnPinningState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Table as TableInstance,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { CSSProperties, MutableRefObject, RefObject, useCallback, useEffect, useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { useEditableData, useSortState, useSyncedColumnFilters } from '@/hooks';
import { ColumnPinDirection, Pagination as PaginationOptions } from '@/types';

import { ButtonSelect } from '../ButtonSelect';
import { TableHeaderCell, TableRow } from './components';
import { getStyles } from './Table.styles';

/**
 * Default Column Sizing
 */
const defaultColumnSizing = {
  size: 50,
  minSize: 20,
  maxSize: Number.MAX_SAFE_INTEGER,
};

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Data
   */
  data: TData[];

  /**
   * Table's columns definition. Must be memoized.
   */
  columns: Array<ColumnDef<TData>>;

  /**
   * Table Ref
   */
  tableRef?: RefObject<HTMLTableElement>;

  /**
   * Table Header Ref
   */
  tableHeaderRef: RefObject<HTMLTableSectionElement>;

  /**
   * Top Offset
   *
   * @type {number}
   */
  topOffset?: number;

  /**
   * Table Header Ref
   */
  paginationRef: RefObject<HTMLDivElement>;

  /**
   * Bottom Offset
   *
   * @type {number}
   */
  bottomOffset?: number;

  /**
   * Scrollable Container Ref
   */
  scrollableContainerRef: RefObject<HTMLDivElement>;

  /**
   * Event Bus
   *
   * @type {EventBus}
   */
  eventBus: EventBus;

  /**
   * Update Row
   */
  onUpdateRow: (row: TData) => Promise<void>;

  /**
   * Width
   *
   * @type {number}
   */
  width: number;

  /**
   * Pagination
   *
   * @type {PaginationOptions}
   */
  pagination: PaginationOptions;

  /**
   * Table Instance
   */
  tableInstance: MutableRefObject<TableInstance<TData>>;
}

/**
 * Page Size Options
 */
const pageSizeOptions = [10, 20, 50, 100, 1000].map((value) => ({
  value,
  label: value.toString(),
}));

/**
 * Get Pinned Header Column Style
 */
const getPinnedHeaderColumnStyle = <TData,>(theme: GrafanaTheme2, column: Column<TData>): CSSProperties => {
  const pinnedPosition = column.getIsPinned();
  if (!pinnedPosition) {
    return {};
  }

  const isFirstRightPinnedColumn = pinnedPosition === 'right' && column.getIsFirstColumn('right');

  return {
    boxShadow: isFirstRightPinnedColumn ? `-1px 0 ${theme.colors.border.weak}` : undefined,
    left: pinnedPosition === 'left' ? `${column.getStart('left')}px` : undefined,
    right: pinnedPosition === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: 'sticky',
    zIndex: 1,
    backgroundColor: theme.colors.background.primary,
  };
};

/**
 * Get Pinned Footer Column Style
 */
const getPinnedFooterColumnStyle = <TData,>(theme: GrafanaTheme2, column: Column<TData>): CSSProperties => {
  const pinnedPosition = column.getIsPinned();
  if (!pinnedPosition) {
    return {};
  }

  const isFirstRightPinnedColumn = pinnedPosition === 'right' && column.getIsFirstColumn('right');

  return {
    boxShadow: isFirstRightPinnedColumn ? `-1px 0 ${theme.colors.border.weak}` : undefined,
    left: pinnedPosition === 'left' ? `${column.getStart('left')}px` : undefined,
    right: pinnedPosition === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: 'sticky',
    zIndex: 1,
    backgroundColor: theme.colors.background.canvas,
  };
};

/**
 * Table
 */
export const Table = <TData,>({
  data,
  columns,
  scrollableContainerRef,
  tableHeaderRef,
  tableRef,
  topOffset,
  eventBus,
  onUpdateRow,
  bottomOffset,
  paginationRef,
  width,
  pagination,
  tableInstance,
}: Props<TData>) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = useStyles2(getStyles);

  /**
   * Grouping
   */
  const grouping = useMemo(() => {
    return columns.filter((column) => column.enableGrouping).map((columnWithGrouping) => columnWithGrouping.id || '');
  }, [columns]);

  /**
   * Column Pinning
   */
  const columnPinning = useMemo((): ColumnPinningState => {
    const pinnedColumn = columns.filter((column) => column.enablePinning);
    return pinnedColumn.reduce(
      (acc, column) => {
        if (column.meta?.config.pin === ColumnPinDirection.LEFT) {
          acc.left?.push(column.id || '');
        } else {
          acc.right?.push(column.id || '');
        }

        return acc;
      },
      { left: [], right: [] } as ColumnPinningState
    );
  }, [columns]);

  /**
   * Expanded
   */
  const [expanded, setExpanded] = useState<ExpandedState>({});

  /**
   * Filtering
   */
  const [columnFilters, setColumnFilters] = useSyncedColumnFilters({ columns, eventBus });

  /**
   * Sorting
   */
  const { sorting, onChangeSort } = useSortState({ columns });

  /**
   * React Table
   */
  const table = useReactTable({
    state: {
      grouping,
      expanded,
      columnFilters,
      sorting,
      pagination: pagination.value,
      columnPinning,
    },

    /**
     * Basic
     */
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    /**
     * Grouping
     */
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableExpanding: true,
    enableGrouping: true,
    onExpandedChange: setExpanded,

    /**
     * Filtering
     */
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    /**
     * Sorting
     */
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: onChangeSort,
    enableSorting: true,

    /**
     * Pagination
     */
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: pagination.onChange,
    manualPagination: pagination.isManual,

    /**
     * Debug
     */
    debugTable: false,
    debugColumns: false,

    /**
     * Defaults
     */
    defaultColumn: defaultColumnSizing,
  });

  /**
   * Rows
   */
  const { rows } = table.getRowModel();

  /**
   * Row Virtualizer
   * Options description - https://tanstack.com/virtual/v3/docs/api/virtualizer
   */
  const rowVirtualizer = useVirtualizer({
    getScrollElement: useCallback(() => scrollableContainerRef.current, [scrollableContainerRef]),
    count: rows.length,
    estimateSize: useCallback(() => 36, []),
    measureElement: useCallback((el: HTMLElement | HTMLTableRowElement) => el.offsetHeight, []),
    overscan: 10,
  });

  /**
   * Virtualized instance options
   */
  const virtualRows = rowVirtualizer.getVirtualItems();

  /**
   * Is Footer Visible
   */
  const isFooterVisible = useMemo(() => {
    return columns.some((column) => !!column.meta?.footerEnabled);
  }, [columns]);

  /**
   * Editable Data
   */
  const editableData = useEditableData({ table, onUpdateRow });

  /**
   * Set table instance
   */
  useEffect(() => {
    tableInstance.current = table;
  }, [table, tableInstance]);

  return (
    <>
      <table
        className={styles.table}
        ref={tableRef}
        style={{
          width: table.getCenterTotalSize(),
        }}
        {...TEST_IDS.table.root.apply()}
      >
        <thead className={styles.header} ref={tableHeaderRef} style={{ top: topOffset }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.headerRow}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={styles.headerCell}
                  style={{
                    maxWidth: header.column.columnDef.maxSize,
                    minWidth: header.column.columnDef.minSize,
                    width: header.getSize(),
                    textAlign: header.column.columnDef.meta?.config.appearance.alignment,
                    justifyContent: header.column.columnDef.meta?.config.appearance.alignment,
                    ...getPinnedHeaderColumnStyle(theme, header.column),
                  }}
                  {...TEST_IDS.table.headerCell.apply(header.id)}
                >
                  <TableHeaderCell header={header} />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
          }}
          className={styles.body}
        >
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <TableRow
                key={row.id}
                row={row}
                virtualRow={virtualRow}
                rowVirtualizer={rowVirtualizer}
                editingRow={editableData.row?.id === row.id ? editableData.row : null}
                onStartEdit={editableData.onStartEdit}
                onCancelEdit={editableData.onCancelEdit}
                onChange={editableData.onChange}
                onSave={editableData.onSave}
                isSaving={editableData.isSaving}
              />
            );
          })}
        </tbody>
        {isFooterVisible && (
          <tfoot className={styles.footer} style={{ maxHeight: rowVirtualizer.getTotalSize(), bottom: bottomOffset }}>
            {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id} className={styles.footerRow}>
                {footerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={styles.footerCell}
                    style={{
                      maxWidth: header.column.columnDef.maxSize,
                      minWidth: header.column.columnDef.minSize,
                      width: header.getSize(),
                      textAlign: header.column.columnDef.meta?.config.appearance.alignment,
                      justifyContent: header.column.columnDef.meta?.config.appearance.alignment,
                      ...getPinnedFooterColumnStyle(theme, header.column),
                    }}
                    {...TEST_IDS.table.footerCell.apply(header.id)}
                  >
                    {flexRender(header.column.columnDef.footer, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        )}
      </table>
      {pagination.isEnabled && (
        <div
          className={styles.paginationRow}
          ref={paginationRef}
          style={{ width: table.getCenterTotalSize() }}
          {...TEST_IDS.table.pagination.apply()}
        >
          <Pagination
            currentPage={pagination.value.pageIndex + 1}
            numberOfPages={
              pagination.isManual ? Math.ceil(pagination.total / pagination.value.pageSize) : table.getPageCount()
            }
            onNavigate={(pageNumber) => {
              pagination.onChange({
                ...pagination.value,
                pageIndex: pageNumber - 1,
              });
            }}
            className={styles.pagination}
            showSmallVersion={width <= 200}
            data-testid={TEST_IDS.table.fieldPageNumber.selector()}
          />
          <ButtonSelect
            options={pageSizeOptions}
            value={{ value: pagination.value.pageSize }}
            onChange={(event) => {
              pagination.onChange({
                pageIndex: 0,
                pageSize: event.value!,
              });
            }}
            data-testid={TEST_IDS.table.fieldPageSize.selector()}
          />
        </div>
      )}
    </>
  );
};
