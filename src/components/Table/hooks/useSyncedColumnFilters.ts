import { EventBus } from '@grafana/data';
import { RefreshEvent } from '@grafana/runtime';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { getVariableColumnFilters, mergeColumnFilters } from '@/utils';

/**
 * Use synced column filters with variables
 */
export const useSyncedColumnFilters = <TData>({
  columns,
  eventBus,
  userFilterPreference,
  defaultFilters,
}: {
  columns: Array<ColumnDef<TData>>;
  eventBus: EventBus;
  userFilterPreference: ColumnFiltersState;
  defaultFilters: ColumnFiltersState;
}) => {
  const initialFilters = () => {
    if (userFilterPreference && !!userFilterPreference.length) {
      return userFilterPreference;
    }

    if (defaultFilters && defaultFilters.length > 0) {
      return defaultFilters;
    }

    return [];
  };

  /**
   * Initial Default filters
   */
  const [initialDefaultFiltersState, setInitialDefaultFiltersState] = useState<ColumnFiltersState>(defaultFilters);

  /**
   * Filtering
   */
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters);

  /**
   * Use user Preferences
   */
  useEffect(() => {
    if (userFilterPreference && !!userFilterPreference.length) {
      setColumnFilters(userFilterPreference);
    }
  }, [userFilterPreference]);

  /**
   * Use defaultFilters if the default filters are changed
   */
  useEffect(() => {
    if (JSON.stringify(initialDefaultFiltersState) !== JSON.stringify(defaultFilters)) {
      setInitialDefaultFiltersState(defaultFilters);
      setColumnFilters(defaultFilters);
    }
  }, [defaultFilters, initialDefaultFiltersState]);

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
