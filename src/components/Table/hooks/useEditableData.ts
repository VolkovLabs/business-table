import { CoreRow, createRow, Row, Table } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';

import { ColumnEditorType } from '@/types';

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
  const onStartEdit = useCallback(
    (row: Row<TData>) => {
      /**
       * Columns
       */
      const columns = table.getAllColumns();

      /**
       * Update original row and replace initial value for text area editors
       */
      const updatedOriginalRow = Object.entries(row.original as CoreRow<TData>).reduce<{ [key: string]: unknown }>(
        (acc, [key, value]) => {
          const foundColumn = columns.find((obj) => obj.id === key);

          /**
           * Update text area value
           */
          if (
            foundColumn?.columnDef.meta?.editable &&
            foundColumn?.columnDef.meta?.editor?.type === ColumnEditorType.TEXTAREA
          ) {
            acc[key] = value.replaceAll('\n', '\\n');
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      /**
       * Set row with updated original row option
       */
      setRow(createRow(table, row.id, updatedOriginalRow as TData, row.index, row.depth));
    },
    [table]
  );

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
