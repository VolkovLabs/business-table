import { EventBus } from '@grafana/data';
import { RefreshEvent } from '@grafana/runtime';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { getVariableColumnFilters, mergeColumnFilters } from '../utils';

/**
 * Use synced column filters with variables
 */
export const useSyncedColumnFilters = <TData>({
  columns,
  eventBus,
}: {
  columns: Array<ColumnDef<TData>>;
  eventBus: EventBus;
}) => {
  /**
   * Filtering
   */
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  /**
   * Set initial filters from variables and update on variable change
   */
  useEffect(() => {
    setColumnFilters((current) => mergeColumnFilters(current, getVariableColumnFilters(columns)));

    const subscription = eventBus.getStream(RefreshEvent).subscribe(() => {
      setColumnFilters((current) => mergeColumnFilters(current, getVariableColumnFilters(columns)));
    });

    return () => {
      return subscription.unsubscribe();
    };
  }, [columns, eventBus]);

  return [columnFilters, setColumnFilters] as [typeof columnFilters, typeof setColumnFilters];
};
