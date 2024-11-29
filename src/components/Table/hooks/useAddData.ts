import { createRow, Row, Table } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';

import { ACTIONS_COLUMN_ID } from '@/constants';
import { ColumnEditorType } from '@/types';

/**
 * Use Add Data
 */
export const useAddData = <TData>({
  table,
  onAddRow,
}: {
  table: Table<TData>;
  onAddRow: (row: TData) => Promise<void>;
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
   * Start
   */
  const onStart = useCallback(() => {
    /**
     * Columns
     */
    const columns = table.getAllColumns();

    const rowPayload = columns.reduce((acc, column) => {
      if (column.id === ACTIONS_COLUMN_ID) {
        return acc;
      }

      const editor = column.columnDef.meta?.addRowEditor;

      let value: string | number | boolean = '';

      switch (editor?.type) {
        case ColumnEditorType.BOOLEAN: {
          value = false;
          break;
        }
        case ColumnEditorType.NUMBER: {
          value = editor.min ?? 0;
          break;
        }
        case ColumnEditorType.DATETIME: {
          value = editor.min ?? new Date().toDateString();
          break;
        }
      }

      return {
        ...acc,
        [column.id]: value,
      };
    }, {});

    /**
     * Set row with updated original row option
     */
    setRow(createRow(table, '0', rowPayload as TData, 0, 0));
  }, [table]);

  /**
   * Cancel
   */
  const onCancel = useCallback(() => {
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
        await onAddRow(row.original);

        setIsSaving(false);
        onCancel();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setIsSaving(false);
      }
    },
    [onCancel, onAddRow]
  );

  return useMemo(
    () => ({
      onStart,
      row,
      onCancel,
      onChange,
      onSave,
      isSaving,
    }),
    [onStart, row, onCancel, onChange, onSave, isSaving]
  );
};
