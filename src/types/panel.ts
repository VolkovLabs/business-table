import { Field } from '@grafana/data';

import { ColumnEditorConfig, ColumnEditorControlOptions } from './column-editor';
import { FieldSource } from './frame';
import { NestedObjectConfig, NestedObjectControlOptions } from './nested-object';
import { PermissionConfig } from './permission';
import {
  CellAggregation,
  CellType,
  ColumnAlignment,
  ColumnFilterMode,
  ColumnFilterType,
  ColumnHeaderFontSize,
} from './table';

/**
 * Column Filter Config
 */
export interface ColumnFilterConfig {
  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled: boolean;

  /**
   * Mode
   *
   * @type {ColumnFilterMode}
   */
  mode: ColumnFilterMode;

  /**
   * Variable
   *
   * @type {string}
   */
  variable: string;
}

/**
 * Column Sort Config
 */
export interface ColumnSortConfig {
  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled: boolean;

  /**
   * If Desc Direction First
   *
   * @type {boolean}
   */
  descFirst: boolean;
}

/**
 * Column Appearance Config
 */
export interface ColumnAppearanceConfig {
  /**
   * Width
   */
  width: {
    /**
     * Auto
     *
     * @type {boolean}
     */
    auto: boolean;

    /**
     * Min
     *
     * @type {number}
     */
    min?: number;

    /**
     * Max
     *
     * @type {number}
     */
    max?: number;

    /**
     * Value
     *
     * @type {number}
     */
    value: number;
  };

  /**
   * Wrap
   */
  wrap: boolean;

  /**
   * Alignment
   *
   * @type {ColumnAlignment}
   */
  alignment: ColumnAlignment;

  /**
   * Background
   */
  background: {
    /**
     * Apply To Row
     *
     * @type {boolean}
     */
    applyToRow: boolean;
  };

  header: {
    /**
     * Font size
     *
     * @type {ColumnHeaderFontSize}
     */
    fontSize: ColumnHeaderFontSize;

    /**
     * Font color
     *
     * @type {string}
     */
    fontColor?: string;

    /**
     * Background color
     *
     * @type {string}
     */
    backgroundColor?: string;
  };
}

/**
 * Column Edit Config
 */
export interface ColumnEditConfig {
  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled: boolean;

  /**
   * Permission
   *
   * @type {PermissionConfig}
   */
  permission: PermissionConfig;

  /**
   * Editor
   *
   * @type {ColumnEditorConfig}
   */
  editor: ColumnEditorConfig;
}

/**
 * Column Pin Direction
 */
export enum ColumnPinDirection {
  NONE = '',
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * Column Config
 */
export interface ColumnConfig {
  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled: boolean;

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
   * Object ID
   *
   * @type {string}
   */
  objectId: string;

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

  /**
   * Filter
   *
   * @type {ColumnFilterConfig}
   */
  filter: ColumnFilterConfig;

  /**
   * Sort
   *
   * @type {ColumnSortConfig}
   */
  sort: ColumnSortConfig;

  /**
   * Appearance
   *
   * @type {ColumnAppearanceConfig}
   */
  appearance: ColumnAppearanceConfig;

  /**
   * Footer
   * Actually, 1 value or 0 if disabled
   *
   * @type {string[]}
   */
  footer: string[];

  /**
   * Edit
   *
   * @type {ColumnEditorConfig}
   */
  edit: ColumnEditConfig;

  /**
   * Pin
   *
   * @type {ColumnPinDirection}
   */
  pin: ColumnPinDirection;
}

/**
 * Table Request Config
 */
export interface TableRequestConfig {
  /**
   * Data Source
   *
   * @type {string}
   */
  datasource: string;

  /**
   * Payload
   *
   * @type {Record<string, unknown>}
   */
  payload: Record<string, unknown>;
}

/**
 * Pagination Mode
 */
export enum PaginationMode {
  CLIENT = 'client',
  QUERY = 'query',
}

/**
 * Table Pagination Config
 */
export interface TablePaginationConfig {
  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled: boolean;

  /**
   * Mode
   *
   * @type {PaginationMode}
   */
  mode: PaginationMode;

  /**
   * Default page size
   *
   * @type {number}
   */
  defaultPageSize: number;

  /**
   * Options for Query Mode
   */
  query?: {
    /**
     * Page Index Variable
     *
     * @type {string}
     */
    pageIndexVariable?: string;

    /**
     * Page Size Variable
     *
     * @type {string}
     */
    pageSizeVariable?: string;

    /**
     * Offset Variable
     *
     * @type {string}
     */
    offsetVariable?: string;

    /**
     * Total Count Field
     *
     * @type {FieldSource}
     */
    totalCountField?: FieldSource;
  };
}

/**
 * Table Config
 */
export interface TableConfig {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Show Header
   *
   * @type {boolean}
   */
  showHeader: boolean;

  /**
   * Items
   *
   * @type {ColumnConfig[]}
   */
  items: ColumnConfig[];

  /**
   * Update Request
   *
   * @type {TableRequestConfig}
   */
  update: TableRequestConfig;

  /**
   * Pagination
   *
   * @type {TablePaginationConfig}
   */
  pagination: TablePaginationConfig;

  /**
   * Expanded by default
   *
   * @type {boolean}
   */
  expanded: boolean;
}

/**
 * Toolbar Options
 */
export interface ToolbarOptions {
  /**
   * Export
   *
   * @type {boolean}
   */
  export: boolean;
}

/**
 * Options
 */
export interface PanelOptions {
  /**
   * Tables
   *
   * @type {TableConfig[]}
   */
  tables: TableConfig[];

  /**
   * Tabs Sorting
   *
   * @type {boolean}
   */
  tabsSorting: boolean;

  /**
   * Toolbar
   *
   * @type {ToolbarOptions}
   */
  toolbar: ToolbarOptions;

  /**
   * Nested Objects
   *
   * @type {NestedObjectConfig[]}
   */
  nestedObjects: NestedObjectConfig[];
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

/**
 * Column Meta
 */
export interface ColumnMeta {
  /**
   * Filter Mode
   *
   * @type {ColumnFilterMode}
   */
  filterMode: ColumnFilterMode;

  /**
   * Available Filter Types
   *
   * @type {ColumnFilterType[]}
   */
  availableFilterTypes: ColumnFilterType[];

  /**
   * Filter Variable Name
   *
   * @type {string}
   */
  filterVariableName: string;

  /**
   * Config
   *
   * @type {ColumnConfig}
   */
  config: ColumnConfig;

  /**
   * Field
   *
   * @type {Field}
   */
  field: Field;

  /**
   * Footer Enabled
   *
   * @type {boolean}
   */
  footerEnabled: boolean;

  /**
   * Editable
   *
   * @type {boolean}
   */
  editable: boolean;

  /**
   * Editor
   *
   * @type {ColumnEditorControlOptions}
   */
  editor?: ColumnEditorControlOptions;

  /**
   * Nested Object Options
   *
   * @type {NestedObjectControlOptions}
   */
  nestedObjectOptions?: NestedObjectControlOptions;
}
