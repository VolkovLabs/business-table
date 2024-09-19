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

  /**
   * Update Sorting State
   */
  useEffect(() => {
    /**
     * Find first sortable column
     */
    const firstSortableColumn = columns.find((column) => column.enableSorting);

    setSorting(firstSortableColumn ? [{ id: firstSortableColumn.id!, desc: firstSortableColumn.sortDescFirst! }] : []);
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
