import { cx } from '@emotion/css';
import { Icon, useStyles2 } from '@grafana/ui';
import { flexRender, Header } from '@tanstack/react-table';
import React from 'react';

import { ACTIONS_COLUMN_ID } from '@/constants';

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

  const sort = header.column.getIsSorted();

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
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        {!!sort && <Icon name={sort === 'asc' ? 'arrow-up' : 'arrow-down'} />}
      </div>
      {header.column.columnDef.enableColumnFilter && <TableHeaderCellFilter header={header} />}
    </>
  );
};
