import { createRow, Row, Table } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';

/**
 * Use Editable Data
 */
export const useEditableData = <TData>({
  table,
  onUpdateRow,
}: {
  table: Table<TData>;
  onUpdateRow: (row: TData) => Promise<void>;
}) => {
  /**
   * Row
   */
  const [row, setRow] = useState<Row<TData> | null>(null);

  /**
   * Is Saving
   */
  const [isSaving, setIsSaving] = useState(false);

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
    },
    [table]
  );

  /**
   * Save
   */
  const onSave = useCallback(
    async (row: Row<TData>) => {
      setIsSaving(true);

      try {
        await onUpdateRow(row.original);

        setIsSaving(false);
        onCancelEdit();
      } catch (e) {
        setIsSaving(false);
      }
    },
    [onCancelEdit, onUpdateRow]
  );

  return useMemo(
    () => ({
      onStartEdit,
      row,
      onCancelEdit,
      onChange,
      onSave,
      isSaving,
    }),
    [onStartEdit, row, onCancelEdit, onChange, onSave, isSaving]
  );
};
