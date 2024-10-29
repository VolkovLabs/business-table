import { cx } from '@emotion/css';
import { Icon, useStyles2 } from '@grafana/ui';
import { flexRender, Header } from '@tanstack/react-table';
import React from 'react';

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
}

/**
 * Table Header Cell
 */
export const TableHeaderCell = <TData,>({ header, size }: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);
  const sort = header.column.getIsSorted();
  const fontColor = header.column.columnDef.meta?.config.appearance.header.fontColor || 'inherit';

  /**
   * Actions Header
   */
  if (header.column.id === ACTIONS_COLUMN_ID) {
    return null;
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
        {...TEST_IDS.tableHeaderCell.root.apply()}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        {!!sort && (
          <Icon
            name={sort === 'asc' ? 'arrow-up' : 'arrow-down'}
            size={size}
            {...TEST_IDS.tableHeaderCell.sortIcon.apply(sort === 'asc' ? 'arrow-up' : 'arrow-down')}
          />
        )}
      </div>
      {header.column.columnDef.enableColumnFilter && <TableHeaderCellFilter header={header} size={size} />}
    </>
  );
};
