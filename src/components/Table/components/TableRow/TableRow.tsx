import { cx } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { Cell, CellContext, Column, Row } from '@tanstack/react-table';
import { VirtualItem, Virtualizer } from '@tanstack/react-virtual';
import React, { CSSProperties } from 'react';

import { ACTIONS_COLUMN_ID, AGGREGATION_TYPES_WITH_DISPLAY_PROCESSOR, TEST_IDS } from '@/constants';
import { CellType, ColumnAlignment, RowHighlightConfig } from '@/types';

import { TableCell, TableEditableCell } from './components';
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
  virtualRow?: VirtualItem;

  /**
   * Measure Element
   */
  rowVirtualizer?: Virtualizer<HTMLDivElement, HTMLElement>;

  /**
   * Editing Row
   */
  editingRow: Row<TData> | null;

  /**
   * Start Edit
   */
  onStartEdit: (row: Row<TData>) => void;

  /**
   * Cancel Edit
   */
  onCancelEdit: () => void;

  /**
   * Change
   */
  onChange: (row: Row<TData>, event: { columnId: string; value: unknown }) => void;

  /**
   * Save
   */
  onSave: (row: Row<TData>) => void;

  /**
   * Is Saving
   *
   * @type {boolean}
   */
  isSaving: boolean;

  /**
   * Is New Row
   *
   * @type {boolean}
   */
  isNewRow?: boolean;

  /**
   * Is Edit Row Enabled
   *
   * @type {boolean}
   */
  isEditRowEnabled?: boolean;

  /**
   * Is Delete Row Enabled
   *
   * @type {boolean}
   */
  isDeleteRowEnabled?: boolean;

  /**
   * Delete Row
   */
  onDelete: (row: Row<TData>) => void;

  /**
   * Is Highlighted
   *
   * @type {boolean}
   */
  isHighlighted: boolean;

  /**
   * Row Highlight Config
   *
   * @type {RowHighlightConfig}
   */
  rowHighlightConfig?: RowHighlightConfig;
}

/**
 * Get Pinned Column Style
 */
const getPinnedColumnStyle = <TData,>(
  theme: GrafanaTheme2,
  column: Column<TData>,
  bgColor: string | undefined
): CSSProperties => {
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
    backgroundColor: bgColor || theme.colors.background.primary,
  };
};

/**
 * Test Ids
 */
export const testIds = TEST_IDS.table;

/**
 * Table Row
 */
export const TableRow = <TData,>({
  virtualRow,
  row,
  rowVirtualizer,
  editingRow,
  onStartEdit,
  onCancelEdit,
  onChange,
  onSave,
  isSaving,
  isNewRow = false,
  isEditRowEnabled,
  isDeleteRowEnabled = false,
  onDelete,
  rowHighlightConfig,
  isHighlighted,
}: Props<TData>) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
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
      if (
        !cell.id.includes(ACTIONS_COLUMN_ID) &&
        field.display &&
        config.type === CellType.COLORED_BACKGROUND &&
        !row.getIsGrouped()
      ) {
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

      /**
       * Apply Display Processor to Aggregated Row
       */
      if (
        !cell.id.includes(ACTIONS_COLUMN_ID) &&
        field.display &&
        config.type === CellType.COLORED_BACKGROUND &&
        cell.getIsAggregated() &&
        AGGREGATION_TYPES_WITH_DISPLAY_PROCESSOR.includes(config.aggregation)
      ) {
        const displayValue = field.display(value);

        if (displayValue.color) {
          cellAppearance.background = displayValue.color;
        }
      }

      /**
       * Set Row Highlight Color
       */
      if (isHighlighted && rowHighlightConfig && rowHighlightConfig.backgroundColor !== 'transparent') {
        acc.background = rowHighlightConfig.backgroundColor;
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

  /**
   * Render Cell
   */
  const renderCell = (cell: Cell<TData, unknown>, rendererProps: CellContext<TData, unknown>) => {
    /**
     * Edit Active
     */
    if (!!editingRow) {
      if (cell.column.id !== ACTIONS_COLUMN_ID) {
        if (isNewRow) {
          if (cell.column.columnDef.meta?.addRowEditable) {
            return (
              <TableEditableCell
                {...cell.getContext()}
                row={editingRow}
                isNewRow={true}
                onChange={onChange}
                isSaving={isSaving}
              />
            );
          }
        } else if (cell.column.columnDef.meta?.editable) {
          return <TableEditableCell {...cell.getContext()} row={editingRow} onChange={onChange} isSaving={isSaving} />;
        }
      }
    }

    return <TableCell cell={cell} rendererProps={rendererProps} row={row} />;
  };

  return (
    <tr
      data-index={virtualRow?.index}
      key={row.id}
      className={cx(styles.row, {
        [styles.newRow]: isNewRow,
      })}
      ref={rowVirtualizer?.measureElement}
      style={{
        transform: `translateY(${virtualRow?.start}px)`,
        backgroundColor: rowAppearance.background,
      }}
      {...testIds.bodyRow.apply(row.id)}
    >
      {visibleCells.map((cell, index) => {
        const cellAppearance = rowAppearance.cells[index];
        const bgColor = cellAppearance?.background;

        const rendererProps = {
          ...cell.getContext(),
          bgColor: bgColor || rowAppearance.background,
          isEditing: !!editingRow,
          onStartEdit,
          onCancelEdit,
          onSave,
          isSaving,
          isEditRowEnabled,
          isDeleteRowEnabled,
          onDelete,
        };

        if (!!editingRow) {
          rendererProps.row = editingRow;
        }

        return (
          <td
            key={cell.id}
            className={cx(styles.cell, {
              [styles.cellExpandable]: row.getCanExpand(),
              [styles.cellEditable]: !row.getIsGrouped() && cell.column.id !== ACTIONS_COLUMN_ID,
            })}
            style={{
              maxWidth: cell.column.columnDef.maxSize,
              minWidth: cell.column.columnDef.minSize,
              width: cell.column.getSize(),
              backgroundColor: bgColor,
              wordBreak: cellAppearance?.wrap ? 'break-word' : 'normal',
              whiteSpace: cellAppearance?.wrap ? 'normal' : 'nowrap',
              justifyContent: cellAppearance?.align,
              textAlign: cellAppearance?.align,
              ...getPinnedColumnStyle(theme, cell.column, bgColor || rowAppearance.background),
            }}
            onClick={row.getToggleExpandedHandler()}
            {...testIds.bodyCell.apply(cell.id)}
          >
            {renderCell(cell, rendererProps)}
          </td>
        );
      })}
    </tr>
  );
};
