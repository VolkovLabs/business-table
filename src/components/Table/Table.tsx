import { useStyles2 } from '@grafana/ui';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useCallback, useRef } from 'react';

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
   * Height
   *
   * @type {number}
   */
  height: number;
}

/**
 * Table
 */
export const Table = <TData,>({ data, columns, height }: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Ref
   */
  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * React Table
   */
  const table = useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
    debugTable: true,
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
    getScrollElement: () => rootRef.current,
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
    <div ref={rootRef} className={styles.root} style={{ height }}>
      <table className={styles.table}>
        <thead className={styles.header}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.headerRow}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={styles.headerCell}
                  style={{
                    width: header.getSize(),
                  }}
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
                    className={styles.cell}
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
