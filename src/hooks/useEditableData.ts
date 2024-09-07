import { createRow, Row, Table } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';

/**
 * Use Editable Data
 */
export const useEditableData = <TData>({ table }: { table: Table<TData> }) => {
  /**
   * Row
   */
  const [row, setRow] = useState<Row<TData> | null>(null);

  /**
   * Start Edit
   */
  const onStartEdit = useCallback((row: Row<TData>) => {
    setRow(row);
  }, []);

  /**
   * Cancel Edit
   */
  const onCancelEdit = useCallback(() => {
    setRow(null);
  }, []);

  /**
   * Change
   */
  const onChange = useCallback(
    (row: Row<TData>, event: { columnId: string; value: unknown }) => {
      const original = {
        ...row.original,
        [event.columnId]: event.value,
      };
      setRow(createRow(table, row.id, original, row.index, row.depth));
      console.log(event);
    },
    [table]
  );

  /**
   * Save
   */
  const onSave = useCallback((row: Row<TData>) => {
    console.log('save', row.original);
  }, []);

  return useMemo(
    () => ({
      onStartEdit,
      row,
      onCancelEdit,
      onChange,
      onSave,
    }),
    [onStartEdit, row, onCancelEdit, onChange, onSave]
  );
};
