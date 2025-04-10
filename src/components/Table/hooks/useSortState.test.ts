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

    const { result } = renderHook(() => useSortState({ columns, userSortingPreference: [] }));

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

    const { result } = renderHook(() => useSortState({ columns, userSortingPreference: [] }));

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

    const { result, rerender } = renderHook(({ columns }) => useSortState({ columns, userSortingPreference: [] }), {
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

  it('Should update sorting state when columns sort option is changed', () => {
    const initialColumns = [
      {
        id: 'name',
        enableSorting: true,
        sortDescFirst: false,
      },
    ];

    const { result, rerender } = renderHook(({ columns }) => useSortState({ columns, userSortingPreference: [] }), {
      initialProps: { columns: initialColumns },
    });

    expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);

    const newColumns = [
      {
        id: 'name',
        enableSorting: true,
        sortDescFirst: true,
      },
    ];

    rerender({ columns: newColumns });

    expect(result.current.sorting).toEqual([{ id: 'name', desc: true }]);
  });

  it('Should update sorting state when column sort options is changed and no more sort columns', () => {
    const initialColumns = [
      {
        id: 'name',
        enableSorting: true,
        sortDescFirst: false,
      },
    ];

    const { result, rerender } = renderHook(({ columns }) => useSortState({ columns, userSortingPreference: [] }), {
      initialProps: { columns: initialColumns },
    });

    expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);

    const newColumns = [
      {
        id: 'name',
        enableSorting: false,
        sortDescFirst: false,
      },
    ];

    rerender({ columns: newColumns });

    expect(result.current.sorting).toEqual([]);
  });

  it('Should initialize sort from user preferences', async () => {
    const initialUserPreferences = [
      {
        id: 'city',
        desc: true,
      },
    ];

    const initialColumns = [
      {
        id: 'name',
        enableSorting: true,
        sortDescFirst: false,
      },
      {
        id: 'city',
        enableSorting: false,
        sortDescFirst: false,
      },
    ];

    const { result } = renderHook(
      ({ columns }) => useSortState({ columns, userSortingPreference: initialUserPreferences }),
      {
        initialProps: { columns: initialColumns },
      }
    );

    expect(result.current.sorting).toEqual([{ id: 'city', desc: true }]);
  });
});
