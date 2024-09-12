import { Field } from '@grafana/data';

import { ColumnEditorConfig, ColumnEditorControlOptions } from './column-editor';
import { CellAggregation, CellType, ColumnAlignment, ColumnFilterMode, ColumnFilterType } from './table';

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
}

/**
 * Edit Permission Mode
 */
export enum EditPermissionMode {
  ALLOWED = '',
  QUERY = 'query',
  USER_ROLE = 'userRole',
}

/**
 * Column Edit Permission Config
 */
export interface ColumnEditPermissionConfig {
  /**
   * Mode
   *
   * @type {EditPermissionMode}
   */
  mode: EditPermissionMode;

  /**
   * Field
   *
   * @type {FieldSource}
   */
  field: FieldSource;

  /**
   * User Role
   *
   * @type {string[]}
   */
  userRole: string[];
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
   * @type {ColumnEditPermissionConfig}
   */
  permission: ColumnEditPermissionConfig;

  /**
   * Editor
   *
   * @type {ColumnEditorConfig}
   */
  editor: ColumnEditorConfig;
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
   */
  edit: ColumnEditConfig;
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
}
