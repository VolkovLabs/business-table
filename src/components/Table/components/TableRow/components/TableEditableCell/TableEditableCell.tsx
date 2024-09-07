import { CellContext, Row } from '@tanstack/react-table';
import React from 'react';

/**
 * Properties
 */
interface Props<TData> extends CellContext<TData, unknown> {
  /**
   * Change
   */
  onChange: (row: Row<TData>, event: { columnId: string; value: unknown }) => void;
}

/**
 * Table Editable Cell
 */
export const TableEditableCell = <TData,>({ onChange, row, column }: Props<TData>) => {
  return (
    <input
      value={row.getValue(column.id) as string}
      onChange={(event) => {
        onChange(row, {
          columnId: column.id,
          value: event.currentTarget.value,
        });
      }}
      style={{ width: '100%' }}
    />
  );
};
