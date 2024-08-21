import { cx } from '@emotion/css';
import { Icon, useStyles2 } from '@grafana/ui';
import { flexRender, Header } from '@tanstack/react-table';
import React from 'react';

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

  return (
    <>
      <span
        onClick={header.column.getToggleSortingHandler()}
        className={cx({
          [styles.labelSortable]: header.column.getCanSort(),
        })}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        {!!sort && <Icon name={sort === 'asc' ? 'arrow-up' : 'arrow-down'} />}
      </span>
      {header.column.columnDef.enableColumnFilter && <TableHeaderCellFilter header={header} />}
    </>
  );
};
