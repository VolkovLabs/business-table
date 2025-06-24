import { EventBus } from '@grafana/data';
import { RefreshEvent } from '@grafana/runtime';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';

import { getVariableColumnFilters, mergeColumnFilters } from '@/utils';

/**
 * Use synced column filters with variables
 */
export const useSyncedColumnFilters = <TData>({
  columns,
  eventBus,
  userFilterPreference,
}: {
  columns: Array<ColumnDef<TData>>;
  eventBus: EventBus;
  userFilterPreference: ColumnFiltersState;
}) => {
  /**
   * Default filters
   */
  const defaultFilters = useMemo(() => {
    return columns
      .map((column) => {
        if (column.meta?.config.filter?.defaultClientValue) {
          return {
            id: column.id,
            value: column.meta.config.filter.defaultClientValue,
          };
        }
        return null;
      })
      .filter(Boolean) as ColumnFiltersState;
  }, [columns]);

  /**
   * Filtering
   */
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    /**
     * Initialize with variable filters
     */
    const variableFilters = getVariableColumnFilters(columns);

    /**
     * If there are custom preferences, use them
     */
    if (userFilterPreference && userFilterPreference.length > 0) {
      return userFilterPreference;
    }

    /**
     * If there are variable filters, use them with default filters
     */
    if (variableFilters.length > 0) {
      return mergeColumnFilters(defaultFilters, variableFilters);
    }

    /**
     * If there are variable filters, use them with default filters
     */
    return defaultFilters;
  });

  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Set initial filters from variables and update on variable change
   */
  useEffect(() => {
    const variableFilters = getVariableColumnFilters(columns);

    if (!isInitialized) {
      /**
       * First was in use state
       */
      setIsInitialized(true);
    } else {
      /**
       * Update only when variables are changed after initialization
       */
      setColumnFilters((current) => mergeColumnFilters(current, variableFilters));
    }

    const subscription = eventBus.getStream(RefreshEvent).subscribe(() => {
      setColumnFilters((current) => mergeColumnFilters(current, getVariableColumnFilters(columns)));
    });

    return () => {
      return subscription.unsubscribe();
    };
  }, [columns, eventBus, isInitialized]);

  /**
   * Update filters if there are no custom filters, but default filters have changed
   */
  useEffect(() => {
    if (!userFilterPreference?.length && isInitialized) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setColumnFilters((current) => {
        const variableFilters = getVariableColumnFilters(columns);
        /**
         * Merge defaults with variables, if present
         */
        return variableFilters.length > 0 ? mergeColumnFilters(defaultFilters, variableFilters) : defaultFilters;
      });
    }
  }, [columns, defaultFilters, isInitialized, userFilterPreference?.length]);

  /**
   * Use user Preferences
   */
  useEffect(() => {
    if (userFilterPreference && userFilterPreference.length > 0) {
      setColumnFilters(userFilterPreference);
    }
  }, [userFilterPreference]);

  return [columnFilters, setColumnFilters] as [typeof columnFilters, typeof setColumnFilters];
};
