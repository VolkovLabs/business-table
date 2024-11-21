import { Row } from '@tanstack/react-table';
import { act, renderHook } from '@testing-library/react';

import { useEditableData } from './useEditableData';
import { createColumnAccessorFn, createColumnMeta } from '@/utils';
import { ColumnEditorType } from '@/types';

/**
 * Mock @tanstack/react-table
 */
jest.mock('@tanstack/react-table', () => ({
  createRow: (table: never, rowId: string, original: Record<string, unknown>) => ({
    id: rowId,
    original,
  }),
}));

describe('useEditableData', () => {
  /**
   * Create Row
   */
  const createRow = (row: { id: string; original: Record<string, unknown> }): Row<unknown> =>
    ({
      ...row,
    }) as any;

  /**
   * Default Table
   */
  const defaultTable = {
    getAllColumns: () => [],
  };

  it('Should allow to start edit', async () => {
    const { result } = renderHook(() => useEditableData({ table: defaultTable as any, onUpdateRow: jest.fn() }));

    const row = createRow({ id: '1', original: { name: 'abc' } });
    await act(async () => result.current.onStartEdit(row));

    expect(result.current.row).toEqual(row);
  });

  it('Should allow to cancel edit', async () => {
    const { result } = renderHook(() => useEditableData({ table: defaultTable as any, onUpdateRow: jest.fn() }));

    const row = createRow({ id: '1', original: { name: 'abc' } });

    await act(async () => result.current.onStartEdit(row));
    expect(result.current.row).toEqual(row);

    await act(async () => result.current.onCancelEdit());
    expect(result.current.row).toEqual(null);
  });

  it('Should allow to change row data', async () => {
    const { result } = renderHook(() => useEditableData({ table: defaultTable as any, onUpdateRow: jest.fn() }));

    const row = createRow({ id: '1', original: { name: 'abc' } });

    await act(async () => result.current.onStartEdit(row));
    expect(result.current.row).toEqual(row);

    await act(async () => result.current.onChange(row, { columnId: 'name', value: 'hello' }));

    expect(result.current.row).toEqual({
      ...row,
      original: { name: 'hello' },
    });
  });

  it('Should allow to save row data', async () => {
    const onUpdateRow = jest.fn();
    const { result } = renderHook(() => useEditableData({ table: defaultTable as any, onUpdateRow }));

    const row = createRow({ id: '1', original: { name: 'abc' } });

    await act(async () => result.current.onStartEdit(row));
    expect(result.current.row).toEqual(row);

    await act(async () =>
      result.current.onSave(
        createRow({
          id: '1',
          original: {
            name: 'hello',
          },
        })
      )
    );

    expect(onUpdateRow).toHaveBeenCalledWith({
      name: 'hello',
    });

    expect(result.current.row).toBeNull();
  });

  it('Should reset saving state if update error', async () => {
    const onUpdateRow = jest.fn().mockRejectedValue(null);
    const { result } = renderHook(() => useEditableData({ table: defaultTable as any, onUpdateRow }));

    const row = createRow({ id: '1', original: { name: 'abc' } });

    await act(async () => result.current.onStartEdit(row));
    expect(result.current.row).toEqual(row);

    await act(async () =>
      result.current.onSave(
        createRow({
          id: '1',
          original: {
            name: 'hello',
          },
        })
      )
    );

    expect(result.current.row).toEqual(row);
    expect(result.current.isSaving).toBeFalsy();
  });

  it('Should allow to start edit and replace value for TextArea editors', async () => {
    const columns = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        columnDef: {
          meta: createColumnMeta({
            editable: false,
          }),
        },
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        columnDef: {
          meta: createColumnMeta({
            editable: true,
            editor: {
              type: ColumnEditorType.NUMBER,
            },
          }),
        },
      },
      {
        id: 'text',
        accessorFn: createColumnAccessorFn('text'),
        columnDef: {
          meta: createColumnMeta({
            editable: true,
            editor: {
              type: ColumnEditorType.TEXTAREA,
            },
          }),
        },
      },
    ];

    const currentTable = {
      getAllColumns: () => columns,
    };

    const { result } = renderHook(() => useEditableData({ table: currentTable as any, onUpdateRow: jest.fn() }));

    const row = createRow({ id: '1', original: { name: 'abc', value: 10, text: 'text test\n' } });
    const expectedRow = createRow({ id: '1', original: { name: 'abc', value: 10, text: 'text test\\n' } });

    await act(async () => result.current.onStartEdit(row));

    expect(result.current.row).toEqual(expectedRow);
  });
});
