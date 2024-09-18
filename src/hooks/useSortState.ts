import { ColumnDef, SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Use Sort State
 */
export const useSortState = <TData>({ columns }: { columns: Array<ColumnDef<TData>> }) => {
  /**
   * State
   */
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    /**
     * Handle editor options
     */
    const sortingState = columns
      .filter((column) => column.enableSorting)
      .map((column) => ({ id: column.id!, desc: column.sortDescFirst! }));

    setSorting(sortingState);
  }, [columns]);

  /**
   * Change state via table handler
   */
  const onChangeSort = useCallback(setSorting, [setSorting]);

  return useMemo(
    () => ({
      sorting,
      onChangeSort,
    }),
    [onChangeSort, sorting]
  );
};
