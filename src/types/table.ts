import { TimeRange } from '@grafana/data';
import { PaginationState } from '@tanstack/react-table';

/**
 * Cell Type
 */
export enum CellType {
  AUTO = 'auto',
  COLORED_TEXT = 'coloredText',
  COLORED_BACKGROUND = 'coloredBackground',
  RICH_TEXT = 'rich_text',
  NESTED_OBJECTS = 'nested_objects',
  BOOLEAN = 'boolean',
  PREFORMATTED = 'preformatted',
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
 * Column Alignment
 */
export enum ColumnAlignment {
  START = 'start',
  CENTER = 'center',
  END = 'end',
}

/**
 * Column Header Font Size
 */
export enum ColumnHeaderFontSize {
  LG = 'lg',
  MD = 'md',
  SM = 'sm',
  XS = 'xs',
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

type Updater<TValue> = (value: TValue) => TValue;
export type ValueOrUpdater<TValue> = TValue | Updater<TValue>;

/**
 * Pagination
 */
export interface Pagination {
  /**
   * Value
   *
   * @type {PaginationState}
   */
  value: PaginationState;

  /**
   * Change
   */
  onChange: (value: ValueOrUpdater<PaginationState>) => void;

  /**
   * Is Enabled
   *
   * @type {boolean}
   */
  isEnabled: boolean;

  /**
   * Is Manual
   *
   * @type {boolean}
   */
  isManual: boolean;

  /**
   * Total
   *
   * @type {number}
   */
  total: number;
}
