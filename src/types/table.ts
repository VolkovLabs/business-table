import { TimeRange } from '@grafana/data';

/**
 * Cell Type
 */
export enum CellType {
  AUTO = 'auto',
  COLORED_TEXT = 'coloredText',
  COLORED_BACKGROUND = 'coloredBackground',
}

/**
 * Cell Aggregation
 */
export enum CellAggregation {
  NONE = 'none',
  SUM = 'sum',
  MIN = 'min',
  MAX = 'max',
  EXTENT = 'extent',
  MEAN = 'mean',
  MEDIAN = 'median',
  UNIQUE = 'unique',
  UNIQUE_COUNT = 'uniqueCount',
  COUNT = 'count',
}

/**
 * Column Filter Type
 */
export enum ColumnFilterType {
  SEARCH = 'search',
  NUMBER = 'number',
  FACETED = 'faceted',
  TIMESTAMP = 'timestamp',
}

/**
 * Number Filter Operator
 */
export enum NumberFilterOperator {
  MORE = '>',
  MORE_OR_EQUAL = '>=',
  LESS = '<',
  LESS_OR_EQUAL = '<=',
  BETWEEN = 'between',
  EQUAL = '=',
  NOT_EQUAL = '!=',
}

/**
 * Column Filter Value
 */
export type ColumnFilterValue =
  | {
      type: ColumnFilterType.FACETED;
      value: string[];
    }
  | {
      type: ColumnFilterType.NUMBER;
      value: [number, number];
      operator: NumberFilterOperator;
    }
  | {
      type: ColumnFilterType.SEARCH;
      value: string;
      caseSensitive: boolean;
    }
  | {
      type: ColumnFilterType.TIMESTAMP;
      value: TimeRange;
      /**
       * Resolved filter value
       */
      valueToFilter?: {
        from: number;
        to: number;
      };
    }
  | {
      type: 'none';
    };

/**
 * Column Filter Mode
 */
export enum ColumnFilterMode {
  CLIENT = 'client',
  QUERY = 'query',
}
