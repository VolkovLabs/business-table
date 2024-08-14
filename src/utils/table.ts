import { dateTime, TypedVariableModel } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { ColumnDef, ColumnFilter, ColumnFiltersState, filterFns, FilterMeta, Row } from '@tanstack/react-table';

import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue, NumberFilterOperator } from '../types';

/**
 * Identify Filter
 */
const identifyFilter = (filterValue: unknown): ColumnFilterValue => {
  if (filterValue && typeof filterValue === 'object' && 'type' in filterValue) {
    if (Object.values(ColumnFilterType).includes(filterValue.type as never)) {
      return filterValue as ColumnFilterValue;
    }
  }

  return {
    type: 'none',
  };
};

/**
 * Apply Number Filter
 * @param row
 * @param columnId
 * @param filterValue
 * @param operator
 */
const numberFilter = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: [number, number],
  operator: NumberFilterOperator
): boolean => {
  const value = row.getValue(columnId) as number;
  const compareValue = filterValue[0];

  switch (operator) {
    case NumberFilterOperator.BETWEEN: {
      const from = Math.min(filterValue[0], filterValue[1]);
      const to = Math.max(filterValue[0], filterValue[1]);

      return value >= from && value <= to;
    }
    case NumberFilterOperator.MORE: {
      return value > compareValue;
    }
    case NumberFilterOperator.MORE_OR_EQUAL: {
      return value >= compareValue;
    }
    case NumberFilterOperator.LESS: {
      return value < compareValue;
    }
    case NumberFilterOperator.LESS_OR_EQUAL: {
      return value <= compareValue;
    }
    case NumberFilterOperator.EQUAL: {
      return value === compareValue;
    }
    case NumberFilterOperator.NOT_EQUAL: {
      return value !== compareValue;
    }
    default: {
      return false;
    }
  }
};

/**
 * Apply Timestamp Filter
 * @param row
 * @param columnId
 * @param filterValue
 */
const timestampFilter = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: { from: number; to: number }
): boolean => {
  const value = row.getValue(columnId);

  /**
   * Invalid value so not to filter
   */
  if (typeof value !== 'number' && typeof value !== 'string') {
    return true;
  }

  /**
   * Value is a timestamp
   */
  if (typeof value === 'number') {
    return value >= filterValue.from && value <= filterValue.to;
  }

  /**
   * Normalize if valid string date
   */
  const date = dateTime(value);

  /**
   * Valid date string
   */
  if (date.isValid()) {
    const numberValue = date.valueOf();
    return numberValue >= filterValue.from && numberValue <= filterValue.to;
  }

  /**
   * Invalid date string so not to filter
   */
  return true;
};

/**
 * Column Filter
 */
export const columnFilter = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown,
  addMeta: (meta: FilterMeta) => void
): boolean => {
  const filter = identifyFilter(filterValue);

  switch (filter.type) {
    case ColumnFilterType.SEARCH: {
      if (filter.caseSensitive) {
        return filterFns.includesStringSensitive(row, columnId, filter.value, addMeta);
      }

      return filterFns.includesString(row, columnId, filter.value, addMeta);
    }
    case ColumnFilterType.NUMBER: {
      return numberFilter(row, columnId, filter.value, filter.operator);
    }
    case ColumnFilterType.FACETED: {
      return filterFns.arrIncludesSome(row, columnId, filter.value, addMeta);
    }
    case ColumnFilterType.TIMESTAMP: {
      /**
       * Filter value should be resolved by resolveFilterValue
       */
      return timestampFilter(row, columnId, filter.valueToFilter!);
    }
    default: {
      return true;
    }
  }
};

/**
 * Normalize Filter Value once before start filtering
 * @param filter
 */
columnFilter.resolveFilterValue = (filter: ColumnFilterValue) => {
  if (filter.type === ColumnFilterType.TIMESTAMP) {
    return {
      ...filter,
      valueToFilter: {
        from: filter.value.from.valueOf(),
        to: filter.value.to.valueOf(),
      },
    };
  }

  return filter;
};

/**
 * Get Filter with new type
 */
export const getFilterWithNewType = (type: ColumnFilterType | 'none'): ColumnFilterValue => {
  switch (type) {
    case ColumnFilterType.NUMBER: {
      return {
        type,
        value: [0, 0],
        operator: NumberFilterOperator.MORE,
      };
    }
    case ColumnFilterType.SEARCH: {
      return {
        type,
        value: '',
        caseSensitive: false,
      };
    }
    case ColumnFilterType.FACETED: {
      return {
        type,
        value: [],
      };
    }
    case ColumnFilterType.TIMESTAMP: {
      const from = dateTime(null);
      const to = dateTime(null);

      return {
        type,
        value: {
          from,
          to,
          raw: {
            from,
            to,
          },
        },
      };
    }

    default: {
      return {
        type,
      };
    }
  }
};

/**
 * Get Supported Filter Types For Variable
 * @param variable
 */
export const getSupportedFilterTypesForVariable = (variable: TypedVariableModel): ColumnFilterType[] => {
  if (variable) {
    switch (variable.type) {
      case 'query':
      case 'custom': {
        if (variable.multi) {
          return [ColumnFilterType.FACETED];
        }
        break;
      }
      case 'textbox':
      case 'constant': {
        return [ColumnFilterType.SEARCH];
      }
    }
  }

  return [];
};

/**
 * Get Column Filters based on variables
 * @param columns
 */
export const getVariableColumnFilters = <TData>(
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
export const mergeColumnFilters = (
  currentItems: ColumnFiltersState,
  itemsToOverride: ColumnFiltersState
): ColumnFiltersState => {
  const filtersMap = new Map<string, ColumnFilter>();

  currentItems.forEach((item) => {
    filtersMap.set(item.id, item);
  });

  itemsToOverride.forEach((item) => {
    if (item.value) {
      /**
       * Override filter with new value
       */
      filtersMap.set(item.id, item);
    } else {
      /**
       * Remove filter
       */
      filtersMap.delete(item.id);
    }
  });

  return [...filtersMap.values()];
};
