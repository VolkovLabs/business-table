import { Row } from '@tanstack/react-table';
import { act, renderHook } from '@testing-library/react';

import { useDeleteData } from './useDeleteData';

/**
 * Mock @tanstack/react-table
 */
jest.mock('@tanstack/react-table', () => ({
  createRow: (table: never, rowId: string, original: Record<string, unknown>) => ({
    id: rowId,
    original,
  }),
}));

describe('useDeleteData', () => {
  /**
   * Create Row
   */
  const createRow = (row: { id: string; original: Record<string, unknown> }): Row<unknown> =>
    ({
      ...row,
    }) as any;

  it('Should allow to start edit', async () => {
    const { result } = renderHook(() => useDeleteData({ onDeleteRow: jest.fn() }));

    const row = createRow({ id: '1', original: { name: 'abc' } });
    await act(async () => result.current.onStart(row));

    expect(result.current.row).toEqual(row);
  });

  it('Should allow to cancel edit', async () => {
    const { result } = renderHook(() => useDeleteData({ onDeleteRow: jest.fn() }));

    const row = createRow({ id: '1', original: { name: 'abc' } });

    await act(async () => result.current.onStart(row));
    expect(result.current.row).toEqual(row);

    await act(async () => result.current.onCancel());
    expect(result.current.row).toEqual(null);
  });

  it('Should not to save if row not selected', async () => {
    const onDeleteRow = jest.fn();
    const { result } = renderHook(() => useDeleteData({ onDeleteRow }));

    expect(result.current.row).toEqual(null);
    await act(async () => result.current.onSave());

    expect(onDeleteRow).not.toHaveBeenCalled();
  });

  it('Should allow to save row data', async () => {
    const onDeleteRow = jest.fn();
    const { result } = renderHook(() => useDeleteData({ onDeleteRow }));

    const row = createRow({ id: '1', original: { name: 'abc' } });

    await act(async () => result.current.onStart(row));
    expect(result.current.row).toEqual(row);

    await act(async () => result.current.onSave());

    expect(onDeleteRow).toHaveBeenCalledWith(row.original);

    expect(result.current.row).toBeNull();
  });

  it('Should reset saving state if update error', async () => {
    const onDeleteRow = jest.fn().mockRejectedValue(null);
    const { result } = renderHook(() => useDeleteData({ onDeleteRow }));

    const row = createRow({ id: '1', original: { name: 'abc' } });

    await act(async () => result.current.onStart(row));
    expect(result.current.row).toEqual(row);

    await act(async () => result.current.onSave());

    expect(result.current.row).toEqual(row);
    expect(result.current.isSaving).toBeFalsy();
  });
});
