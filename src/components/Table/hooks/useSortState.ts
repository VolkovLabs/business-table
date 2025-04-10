import { ColumnDef, SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Use Sort State
 */
export const useSortState = <TData>({
  columns,
  userSortingPreference,
}: {
  columns: Array<ColumnDef<TData>>;
  userSortingPreference: SortingState;
}) => {
  /**
   * State
   */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [column, setColumnId] = useState<ColumnDef<TData>>();

  /**
   * Update Sorting State
   */
  useEffect(() => {
    /**
     * Find first sortable column
     */
    const firstSortableColumn = columns.find((column) => column.enableSorting);

    if (firstSortableColumn && !userSortingPreference.length) {
      /**
       * Change if new column
       */
      if (firstSortableColumn.id !== column?.id) {
        setSorting([{ id: firstSortableColumn.id!, desc: firstSortableColumn.sortDescFirst! }]);
        setColumnId(firstSortableColumn);
      }

      /**
       * Change if sort direction for column is changed
       */
      if (firstSortableColumn.id === column?.id && firstSortableColumn.sortDescFirst !== column?.sortDescFirst) {
        setSorting([{ id: firstSortableColumn.id!, desc: firstSortableColumn.sortDescFirst! }]);
        setColumnId(firstSortableColumn);
      }
    }

    /**
     * Reset state
     */
    if (!firstSortableColumn && !!sorting.length) {
      setSorting([]);
      setColumnId(undefined);
    }
  }, [column, columns, sorting, userSortingPreference.length]);

  /**
   * Use user Preferences
   */
  useEffect(() => {
    if (userSortingPreference && !!userSortingPreference.length) {
      setSorting(userSortingPreference);

      /**
       * Find first sortable column based on preferences
       */
      const firstSortableColumn = columns.find((column) => column.id === userSortingPreference[0].id);
      setColumnId(firstSortableColumn);
    }
  }, [columns, userSortingPreference]);

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
