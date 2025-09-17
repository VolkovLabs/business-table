import { Row } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';

/**
 * Use Delete Data
 */
export const useDeleteData = <TData>({ onDeleteRow }: { onDeleteRow: (row: TData) => Promise<void> }) => {
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
  const onStart = useCallback((row: Row<TData>) => {
    /**
     * Set row
     */
    setRow(row);
  }, []);

  /**
   * Cancel
   */
  const onCancel = useCallback(() => {
    setRow(null);
  }, []);

  /**
   * Save
   */
  const onSave = useCallback(async () => {
    if (!row) {
      return;
    }

    setIsSaving(true);
    

    try {
      onCancel();      
      await onDeleteRow(row.original);

      setIsSaving(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setIsSaving(false);
    }
  }, [row, onDeleteRow, onCancel]);

  return useMemo(
    () => ({
      onStart,
      row,
      onCancel,
      onSave,
      isSaving,
    }),
    [onStart, row, onCancel, onSave, isSaving]
  );
};
