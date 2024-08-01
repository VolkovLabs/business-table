/**
 * Cell Type
 */
export enum CellType {
  AUTO = 'auto',
  COLORED_TEXT = 'coloredText',
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
 * Cell Options
 */
export interface CellOptions {
  /**
   * Cell Type
   *
   * @type {CellType}
   */
  type: CellType;
}

/**
 * Field Source
 */
export interface FieldSource {
  /**
   * Field Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Data Frame ID or Frame Index if no specified
   */
  source: string | number;
}

/**
 * Column Config
 */
export interface ColumnConfig {
  /**
   * Field
   *
   * @type {FieldSource}
   */
  field: FieldSource;

  /**
   * Label
   *
   * @type {string}
   */
  label: string;

  /**
   * Type
   *
   * @type {CellType}
   */
  type: CellType;

  /**
   * Group
   *
   * @type {boolean}
   */
  group: boolean;

  /**
   * Aggregation
   *
   * @type {CellAggregation}
   */
  aggregation: CellAggregation;
}

/**
 * Group
 */
export interface Group {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Items
   *
   * @type {ColumnConfig[]}
   */

  items: ColumnConfig[];
}

/**
 * Options
 */
export interface PanelOptions {
  /**
   * Groups
   *
   * @type {Group[]}
   */
  groups: Group[];
}

/**
 * Recursive Partial
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<RecursivePartial<U>>
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};
