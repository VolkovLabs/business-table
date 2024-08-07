import { TypedVariableModel } from '@grafana/data';
import { filterFns, FilterMeta, Row } from '@tanstack/react-table';

import { ColumnFilterType, ColumnFilterValue, NumberFilterOperator } from '../types';

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
    default: {
      return true;
    }
  }
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
