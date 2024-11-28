import { CellContext, Row } from '@tanstack/react-table';
import React, { useCallback } from 'react';

import { editableColumnEditorsRegistry } from '@/components';

/**
 * Properties
 */
interface Props<TData> extends CellContext<TData, unknown> {
  /**
   * Change
   */
  onChange: (row: Row<TData>, event: { columnId: string; value: unknown }) => void;

  /**
   * Is Saving
   *
   * @type {boolean}
   */
  isSaving: boolean;

  /**
   * Is New Row
   *
   * @type {boolean}
   */
  isNewRow?: boolean;
}

/**
 * Table Editable Cell
 */
export const TableEditableCell = <TData,>({ onChange, row, column, isSaving, isNewRow }: Props<TData>) => {
  /**
   * Change Value
   */
  const onChangeValue = useCallback(
    (value: unknown) => {
      onChange(row, {
        columnId: column.id,
        value,
      });
    },
    [column.id, onChange, row]
  );

  /**
   * Editor
   */
  const editor = isNewRow ? column.columnDef.meta?.addRowEditor : column.columnDef.meta?.editor;
  const ControlComponent = editor ? editableColumnEditorsRegistry.get(editor.type)?.control : undefined;

  if (!editor || !ControlComponent) {
    return null;
  }

  const value = row.getValue(column.id);

  return <ControlComponent value={value} onChange={onChangeValue} config={editor as never} isSaving={isSaving} />;
};
