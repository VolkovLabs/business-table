import { cx } from '@emotion/css';
import { IconButton, useStyles2 } from '@grafana/ui';
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { RefObject, useCallback, useMemo, useState } from 'react';
import { TEST_IDS } from '../../constants';

import { getStyles } from './Table.styles';

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
   * React Table
   */
  const table = useReactTable({
    state: {
      grouping,
      expanded,
    },
    data,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    columns,
    enableExpanding: true,
    enableGrouping: true,
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
                {flexRender(header.column.columnDef.header, header.getContext())}
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
