import { renderHook } from '@testing-library/react';

import { useSortState } from './useSortState';

describe('useSortState', () => {
  it('Should set first sortable column to initial state', () => {
    const columns = [
      {
        id: 'name',
        enableSorting: true,
        sortDescFirst: false,
      },
      {
        id: 'age',
        enableSorting: false,
        sortDescFirst: false,
      },
      {
        id: 'location',
        enableSorting: true,
        sortDescFirst: true,
      },
    ];

    const { result } = renderHook(() => useSortState({ columns }));

    expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);
  });

  it('Should work if no sortable column', () => {
    const columns = [
      {
        id: 'name',
        enableSorting: false,
        sortDescFirst: false,
      },
    ];

    const { result } = renderHook(() => useSortState({ columns }));

    expect(result.current.sorting).toEqual([]);
  });

  it('Should update sorting state when columns change', () => {
    const initialColumns = [
      {
        id: 'name',
        enableSorting: true,
        sortDescFirst: false,
      },
    ];

    const { result, rerender } = renderHook(({ columns }) => useSortState({ columns }), {
      initialProps: { columns: initialColumns },
    });

    expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);

    const newColumns = [
      {
        id: 'age',
        enableSorting: true,
        sortDescFirst: true,
      },
      {
        id: 'location',
        enableSorting: false,
        sortDescFirst: false,
      },
    ];

    rerender({ columns: newColumns });

    expect(result.current.sorting).toEqual([{ id: 'age', desc: true }]);
  });
});
