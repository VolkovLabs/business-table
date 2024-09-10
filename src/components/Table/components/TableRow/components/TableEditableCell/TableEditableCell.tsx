import { dateTime } from '@grafana/data';
import { DateTimePicker, Input, Select } from '@grafana/ui';
import { CellContext, Row } from '@tanstack/react-table';
import { NumberInput } from '@volkovlabs/components';
import React, { useCallback } from 'react';

import { ColumnEditorType } from '@/types';

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
}

/**
 * Table Editable Cell
 */
export const TableEditableCell = <TData,>({ onChange, row, column, isSaving }: Props<TData>) => {
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
  const editor = column.columnDef.meta?.editor;

  if (!editor) {
    return null;
  }

  const value = row.getValue(column.id);

  switch (editor.type) {
    case ColumnEditorType.STRING: {
      return (
        <Input
          value={value as string}
          onChange={(event) => {
            onChangeValue(event.currentTarget.value);
          }}
          style={{ width: '100%' }}
          disabled={isSaving}
        />
      );
    }
    case ColumnEditorType.NUMBER: {
      return (
        <NumberInput
          value={value as number}
          onChange={(value) => onChangeValue(value)}
          min={editor.min}
          max={editor.max}
        />
      );
    }
    case ColumnEditorType.SELECT: {
      return <Select value={value} onChange={(event) => onChangeValue(event.value)} options={editor.options} />;
    }
    case ColumnEditorType.DATETIME: {
      return (
        <DateTimePicker
          date={dateTime(value ? (value as string) : undefined)}
          onChange={(date) => onChangeValue(date?.toISOString())}
          minDate={editor.min ? new Date(editor.min) : undefined}
          maxDate={editor.max ? new Date(editor.max) : undefined}
        />
      );
    }
    default: {
      return 'Unsupported Editor';
    }
  }
};
