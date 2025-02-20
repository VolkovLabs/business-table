import { cx } from '@emotion/css';
import { Icon, IconButton, Tooltip, useStyles2 } from '@grafana/ui';
import { flexRender, Header } from '@tanstack/react-table';
import React, { useMemo } from 'react';

import { ACTIONS_COLUMN_ID, TEST_IDS } from '@/constants';
import { ColumnHeaderFontSize } from '@/types';

import { getStyles } from './TableHeaderCell.styles';
import { TableHeaderCellFilter } from './TableHeaderCellFilter';

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Header
   */
  header: Header<TData, unknown>;

  /**
   * Size
   *
   * @type {ColumnHeaderFontSize}
   */
  size: ColumnHeaderFontSize;

  /**
   * Is Add Row Enabled
   *
   * @type {boolean}
   */
  isAddRowEnabled: boolean;

  /**
   * Add Row
   */
  onAddRow: () => void;
}

/**
 * Test Ids
 */
export const testIds = TEST_IDS.tableHeaderCell;

/**
 * Table Header Cell
 */
export const TableHeaderCell = <TData,>({ header, size, isAddRowEnabled, onAddRow }: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);
  const sort = header.column.getIsSorted();
  const fontColor = header.column.columnDef.meta?.config.appearance.header.fontColor || 'inherit';
  const tooltip = useMemo(
    () => header.column.columnDef.meta?.config.columnTooltip,
    [header.column.columnDef.meta?.config.columnTooltip]
  );
  /**
   * Actions Header
   */
  if (header.column.id === ACTIONS_COLUMN_ID) {
    return (
      <div className={styles.actions}>
        {isAddRowEnabled && (
          <IconButton
            name="plus"
            size={size}
            aria-label="Add Row"
            onClick={onAddRow}
            {...testIds.buttonAddRow.apply()}
          />
        )}
        <p {...testIds.actionHeaderText.apply()} className={styles.actionHeader}>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={header.column.getToggleSortingHandler()}
        className={cx({
          [styles.labelSortable]: header.column.getCanSort(),
        })}
        style={{
          color: fontColor,
        }}
        {...testIds.root.apply()}
      >
        {!!tooltip && (
          <Tooltip content={tooltip} {...testIds.tooltip.apply()}>
            <Icon name="exclamation-circle" size="xs" aria-label="JSON error" className={styles.tooltip} />
          </Tooltip>
        )}
        {flexRender(header.column.columnDef.header, header.getContext())}
        {!!sort && (
          <Icon
            name={sort === 'asc' ? 'arrow-up' : 'arrow-down'}
            size={size}
            {...testIds.sortIcon.apply(sort === 'asc' ? 'arrow-up' : 'arrow-down')}
          />
        )}
      </div>
      {header.column.columnDef.enableColumnFilter && <TableHeaderCellFilter header={header} size={size} />}
    </>
  );
};
