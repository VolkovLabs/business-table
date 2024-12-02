import { Row } from '@tanstack/react-table';
import { act, renderHook } from '@testing-library/react';

import { ACTIONS_COLUMN_ID } from '@/constants';
import { ColumnEditorType } from '@/types';
import { createColumnMeta } from '@/utils';

import { useAddData } from './useAddData';

/**
 * Mock @tanstack/react-table
 */
jest.mock('@tanstack/react-table', () => ({
  createRow: (table: never, rowId: string, original: Record<string, unknown>) => ({
    id: rowId,
    original,
  }),
}));

describe('useAddData', () => {
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

  it('Should allow to start and set default values', async () => {
    const columns = [
      {
        id: 'string',
        columnDef: {
          meta: createColumnMeta({
            addRowEditable: false,
            addRowEditor: {
              type: ColumnEditorType.STRING,
            },
          }),
        },
      },
      {
        id: 'number',
        columnDef: {
          meta: createColumnMeta({
            addRowEditable: false,
            addRowEditor: {
              type: ColumnEditorType.NUMBER,
            },
          }),
        },
      },
      {
        id: 'numberWithMin',
        columnDef: {
          meta: createColumnMeta({
            addRowEditable: false,
            addRowEditor: {
              type: ColumnEditorType.NUMBER,
              min: 10,
            },
          }),
        },
      },
      {
        id: 'boolean',
        columnDef: {
          meta: createColumnMeta({
            addRowEditable: false,
            addRowEditor: {
              type: ColumnEditorType.BOOLEAN,
            },
          }),
        },
      },
      {
        id: 'datetime',
        columnDef: {
          meta: createColumnMeta({
            addRowEditable: false,
            addRowEditor: {
              type: ColumnEditorType.DATETIME,
            },
          }),
        },
      },
      {
        id: 'datetimeWithMin',
        columnDef: {
          meta: createColumnMeta({
            addRowEditable: false,
            addRowEditor: {
              type: ColumnEditorType.DATETIME,
              min: new Date('02-02-2020').toISOString(),
            },
          }),
        },
      },
      {
        id: ACTIONS_COLUMN_ID,
      },
    ];

    const currentTable = {
      getAllColumns: () => columns,
    };

    const { result } = renderHook(() => useAddData({ table: currentTable as never, onAddRow: jest.fn() }));

    await act(async () => result.current.onStart());

    expect(result.current.row).toEqual(
      expect.objectContaining({
        id: '0',
        original: {
          string: '',
          boolean: false,
          number: 0,
          numberWithMin: 10,
          datetime: expect.any(String),
          datetimeWithMin: new Date('02-02-2020').toISOString(),
        },
      })
    );
  });

  it('Should allow to cancel edit', async () => {
    const { result } = renderHook(() => useAddData({ table: defaultTable as any, onAddRow: jest.fn() }));

    await act(async () => result.current.onStart());
    expect(result.current.row).toEqual(
      expect.objectContaining({
        id: '0',
      })
    );

    await act(async () => result.current.onCancel());
    expect(result.current.row).toEqual(null);
  });

  it('Should allow to change row data', async () => {
    const columns = [
      {
        id: 'string',
        columnDef: {
          meta: createColumnMeta({
            addRowEditable: false,
            addRowEditor: {
              type: ColumnEditorType.STRING,
            },
          }),
        },
      },
    ];

    /**
     * Default Table
     */
    const defaultTable = {
      getAllColumns: () => columns,
    };

    const { result } = renderHook(() => useAddData({ table: defaultTable as never, onAddRow: jest.fn() }));

    await act(async () => result.current.onStart());

    expect(result.current.row).toEqual(
      expect.objectContaining({
        original: {
          string: '',
        },
      })
    );

    await act(async () => result.current.onChange(result.current.row!, { columnId: 'string', value: 'hello' }));

    expect(result.current.row).toEqual(
      expect.objectContaining({
        original: {
          string: 'hello',
        },
      })
    );
  });

  it('Should allow to save row data', async () => {
    const onAddRow = jest.fn();
    const { result } = renderHook(() => useAddData({ table: defaultTable as any, onAddRow }));

    await act(async () => result.current.onStart());
    expect(result.current.row).toBeDefined();

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

    expect(onAddRow).toHaveBeenCalledWith({
      name: 'hello',
    });

    expect(result.current.row).toBeNull();
  });

  it('Should reset saving state if update error', async () => {
    const onAddRow = jest.fn().mockRejectedValue(null);
    const { result } = renderHook(() => useAddData({ table: defaultTable as any, onAddRow }));

    await act(async () => result.current.onStart());

    expect(result.current.row).toBeDefined();

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

    expect(result.current.row).toBeDefined();
    expect(result.current.isSaving).toBeFalsy();
  });
});
