import { EventBus } from '@grafana/data';
import { getTemplateSrv, RefreshEvent } from '@grafana/runtime';
import { ColumnDef, ColumnFilter, ColumnFiltersState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '../types';
import { getSupportedFilterTypesForVariable } from '../utils';

const getVariableColumnFilters = <TData>(
  columns: Array<ColumnDef<TData>>
): Array<{ id: string; value: ColumnFilterValue | undefined }> => {
  const columnsToSync = columns.filter(
    (column) => column.enableColumnFilter && column.meta?.filterMode === ColumnFilterMode.QUERY
  );

  if (columnsToSync.length) {
    const variables = getTemplateSrv().getVariables();
    const columnFilters: Array<{ id: string; value: ColumnFilterValue | undefined }> = [];

    columnsToSync.forEach((column) => {
      const variable = variables.find((variable) => variable.name === column.meta?.filterVariableName);

      if (variable) {
        const currentValue = 'current' in variable ? variable.current.value : '';
        const supportedFilterTypes = getSupportedFilterTypesForVariable(variable);
        const filterType = supportedFilterTypes[0];

        if (filterType && currentValue) {
          switch (filterType) {
            case ColumnFilterType.SEARCH: {
              columnFilters.push({
                id: column.id!,
                value: {
                  type: ColumnFilterType.SEARCH,
                  value: currentValue as string,
                  caseSensitive: false,
                },
              });
              break;
            }
            case ColumnFilterType.FACETED: {
              columnFilters.push({
                id: column.id!,
                value: {
                  type: ColumnFilterType.FACETED,
                  value: currentValue as string[],
                },
              });
              break;
            }
          }
        } else {
          columnFilters.push({
            id: column.id!,
            value: undefined,
          });
        }
      }
    });

    return columnFilters;
  }

  return [];
};

/**
 * Merge column filters
 */
const mergeColumnFilters = (
  currentItems: ColumnFiltersState,
  itemsToOverride: ColumnFiltersState
): ColumnFiltersState => {
  const filtersMap = new Map<string, ColumnFilter>();

  currentItems.forEach((item) => {
    filtersMap.set(item.id, item);
  });

  itemsToOverride.forEach((item) => {
    if (item.value) {
      filtersMap.set(item.id, item);
    } else {
      filtersMap.delete(item.id);
    }
  });

  return [...filtersMap.values()];
};

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
