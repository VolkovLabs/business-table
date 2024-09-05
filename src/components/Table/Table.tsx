import { EventBus } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { RefObject, useCallback, useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { useSyncedColumnFilters } from '@/hooks';

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
   * Scrollable Container Ref
   */
  scrollableContainerRef: RefObject<HTMLDivElement>;

  /**
   * Event Bus
   *
   * @type {EventBus}
   */
  eventBus: EventBus;
}

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
}: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Grouping
   */
  const grouping = useMemo(() => {
    return columns.filter((column) => column.enableGrouping).map((columnWithGrouping) => columnWithGrouping.id || '');
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
  const [sorting, setSorting] = React.useState<SortingState>([]);

  /**
   * React Table
   */
  const table = useReactTable({
    state: {
      grouping,
      expanded,
      columnFilters,
      sorting,
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
    onSortingChange: setSorting,
    enableSorting: true,

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

  return (
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

          return <TableRow key={row.id} row={row} virtualRow={virtualRow} rowVirtualizer={rowVirtualizer} />;
        })}
      </tbody>
      {isFooterVisible && (
        <tfoot className={styles.footer} style={{ maxHeight: rowVirtualizer.getTotalSize() }}>
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
                  }}
                  {...TEST_IDS.table.footerCell.apply(header.id)}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      )}
    </table>
  );
};
