import { cx } from '@emotion/css';
import { IconButton, useStyles2 } from '@grafana/ui';
import { flexRender, Row } from '@tanstack/react-table';
import { VirtualItem, Virtualizer } from '@tanstack/react-virtual';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { CellType, ColumnAlignment } from '@/types';

import { getStyles } from './TableRow.styles';

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Row
   */
  row: Row<TData>;

  /**
   * Virtual Row
   *
   * @type {VirtualItem}
   */
  virtualRow: VirtualItem;

  /**
   * Measure Element
   */
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLElement>;
}

/**
 * Table Row
 */
export const TableRow = <TData,>({ virtualRow, row, rowVirtualizer }: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Visible cells
   */
  const visibleCells = row.getVisibleCells();

  /**
   * Row Appearance
   */
  const rowAppearance = visibleCells.reduce(
    (acc, cell) => {
      /**
       * No meta
       */
      if (!cell.column.columnDef.meta) {
        return acc;
      }

      const cellAppearance: { background?: string; wrap?: boolean; align?: ColumnAlignment } = {};

      const { field, config } = cell.column.columnDef.meta;
      const value = cell.getValue();

      cellAppearance.wrap = config.appearance.wrap;
      cellAppearance.align = config.appearance.alignment;

      /**
       * Set background color
       */
      if (field.display && config.type === CellType.COLORED_BACKGROUND && !row.getIsGrouped()) {
        const displayValue = field.display(value);

        if (displayValue.color) {
          cellAppearance.background = displayValue.color;

          /**
           * Set latest cell background color to row
           */
          if (config.appearance.background.applyToRow) {
            acc.background = displayValue.color;
          }
        }
      }

      return {
        ...acc,
        cells: acc.cells.concat(cellAppearance),
      };
    },
    {
      background: undefined,
      cells: [],
    } as {
      background?: string;
      cells: Array<{ background?: string; wrap?: boolean; align?: ColumnAlignment }>;
    }
  );

  return (
    <tr
      data-index={virtualRow.index}
      key={row.id}
      className={styles.row}
      ref={rowVirtualizer.measureElement}
      style={{
        transform: `translateY(${virtualRow.start}px)`,
        backgroundColor: rowAppearance.background,
      }}
      {...TEST_IDS.table.bodyRow.apply(row.id)}
    >
      {visibleCells.map((cell, index) => {
        const cellAppearance = rowAppearance.cells[index];
        const bgColor = cellAppearance?.background;

        const rendererProps = {
          ...cell.getContext(),
          bgColor: bgColor || rowAppearance.background,
        };

        return (
          <td
            key={cell.id}
            className={cx(styles.cell, {
              [styles.cellExpandable]: row.getCanExpand(),
            })}
            style={{
              maxWidth: cell.column.columnDef.maxSize,
              minWidth: cell.column.columnDef.minSize,
              width: cell.column.getSize(),
              backgroundColor: bgColor,
              wordBreak: cellAppearance?.wrap ? 'break-all' : 'normal',
              justifyContent: cellAppearance?.align,
              textAlign: cellAppearance?.align,
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
                ? flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, rendererProps)
                : flexRender(cell.column.columnDef.cell, rendererProps)}
          </td>
        );
      })}
    </tr>
  );
};
