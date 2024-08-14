import { cx } from '@emotion/css';
import { EventBus } from '@grafana/data';
import { IconButton, useStyles2 } from '@grafana/ui';
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
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { RefObject, useCallback, useMemo, useState } from 'react';

import { TEST_IDS } from '../../constants';
import { useSyncedColumnFilters } from '../../hooks';
import { getStyles } from './Table.styles';
import { TableHeaderCell } from './TableHeaderCell';

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
   * React Table
   */
  const table = useReactTable({
    state: {
      grouping,
      expanded,
      columnFilters,
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
     * Debug
     */
    debugTable: false,
    debugColumns: false,
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

  return (
    <table className={styles.table} ref={tableRef} {...TEST_IDS.table.root.apply()}>
      <thead className={styles.header} ref={tableHeaderRef} style={{ top: topOffset }}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className={styles.headerRow}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className={styles.headerCell}
                style={{
                  width: header.getSize(),
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
            <tr
              data-index={virtualRow.index}
              key={row.id}
              className={styles.row}
              ref={rowVirtualizer.measureElement}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cx(styles.cell, {
                    [styles.cellExpandable]: row.getCanExpand(),
                  })}
                  style={{
                    width: cell.column.getSize(),
                  }}
                  onClick={row.getToggleExpandedHandler()}
                  {...TEST_IDS.table.bodyCell.apply(cell.id)}
                >
                  {cell.getIsGrouped() && (
                    <IconButton
                      name={row.getIsExpanded() ? 'angle-down' : 'angle-right'}
                      aria-label={TEST_IDS.table.buttonExpandCell.selector(cell.id)}
                      className={styles.expandButton}
                    />
                  )}
                  {cell.getIsPlaceholder()
                    ? null
                    : cell.getIsAggregated()
                      ? flexRender(
                          cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      : flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
