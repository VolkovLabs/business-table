import { flexRender, Header } from '@tanstack/react-table';
import React from 'react';

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
  return (
    <>
      {flexRender(header.column.columnDef.header, header.getContext())}
      {header.column.columnDef.enableColumnFilter && <TableHeaderCellFilter header={header} />}
    </>
  );
};
