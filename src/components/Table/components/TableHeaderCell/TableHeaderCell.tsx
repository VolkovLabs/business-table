import { css, cx } from '@emotion/css';
import { Icon, useStyles2, useTheme2 } from '@grafana/ui';
import { flexRender, Header } from '@tanstack/react-table';
import React from 'react';

import { ACTIONS_COLUMN_ID, TEST_IDS } from '@/constants';

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
}

/**
 * Table Header Cell
 */
export const TableHeaderCell = <TData,>({ header }: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);
  const theme = useTheme2();
  const sort = header.column.getIsSorted();
  const fontColor = header.column.columnDef.meta?.config.appearance.colors?.fontColor || 'inherit';
  const fontSize = header.column.columnDef.meta?.config.appearance.fontSize || theme.typography.fontSize;

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
        className={cx(
          {
            [styles.labelSortable]: header.column.getCanSort(),
          },
          css`
            color: ${fontColor};
            font-size: ${fontSize}px;
          `
        )}
        {...TEST_IDS.tableHeaderCell.root.apply()}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        {!!sort && (
          <Icon
            name={sort === 'asc' ? 'arrow-up' : 'arrow-down'}
            {...TEST_IDS.tableHeaderCell.sortIcon.apply(sort === 'asc' ? 'arrow-up' : 'arrow-down')}
          />
        )}
      </div>
      {header.column.columnDef.enableColumnFilter && <TableHeaderCellFilter header={header} />}
    </>
  );
};
