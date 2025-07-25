import { Field } from '@grafana/data';
import { BarGaugeDisplayMode, BarGaugeValueMode } from '@grafana/schema';
import { IconName } from '@grafana/ui';

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
  ColumnFilterValue,
  ColumnHeaderFontSize,
  ImageScale,
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

  /**
   * Default client value
   *
   * @type {ColumnFilterValue}
   */
  defaultClientValue?: ColumnFilterValue;
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
 * Column New Row Edit Config
 */
export interface ColumnNewRowEditConfig {
  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled: boolean;

  /**
   * Editor
   *
   * @type {ColumnEditorConfig}
   */
  editor: ColumnEditorConfig;
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
 * Gauge cell type config
 */
export interface GaugeConfig {
  /**
   * Display mode
   *
   * @type {BarGaugeDisplayMode}
   */
  mode: BarGaugeDisplayMode;

  /**
   * Value Display Mode
   *
   * @type {BarGaugeDisplayMode}
   */
  valueDisplayMode: BarGaugeValueMode;

  /**
   * Value text size
   *
   * @type {number}
   */
  valueSize: number;
}

/**
 * File cell button size
 */
export enum FileButtonSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

/**
 * File cell button varian
 */
export enum FileButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DESTRUCTIVE = 'destructive',
  SUCCESS = 'success',
}

/**
 * File cell type config
 */
export interface FileConfig {
  /**
   * Button Size
   *
   * @type {FileButtonSize}
   */
  size: FileButtonSize;

  /**
   * Variant
   *
   * @type {FileButtonVariant}
   */
  variant: FileButtonVariant;

  /**
   * Value text size
   *
   * @type {string}
   */
  text: string;

  /**
   * Display preview
   *
   * @type {boolean}
   */
  displayPreview?: boolean;

  /**
   * File name
   *
   * @type {boolean}
   */
  fileName?: FieldSource;
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
   * Tooltip for column
   *
   * @type {string}
   */
  columnTooltip: string;

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
   * New Row Edit
   *
   * @type {ColumnNewRowEditConfig}
   */
  newRowEdit: ColumnNewRowEditConfig;

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

  /**
   * Preformatted style
   *
   * @type {boolean}
   */
  preformattedStyle: boolean;

  /**
   * Scale algorithm
   *
   * @type {ImageScale}
   */
  scale: ImageScale;

  /**
   * Gauge cell type config
   *
   * @type {GaugeConfig}
   */
  gauge: GaugeConfig;

  /**
   * File cell type config
   *
   * @type {FileConfig}
   */
  fileCell: FileConfig;

  /**
   * Number of rows for JSON cell type
   *
   * @type {number}
   */
  showingRows: number;
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
 * Table Operation Config
 */
export interface TableOperationConfig {
  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled: boolean;

  /**
   * Request
   *
   * @type {TableRequestConfig}
   */
  request: TableRequestConfig;

  /**
   * Permission
   *
   * @type {PermissionConfig}
   */
  permission: PermissionConfig;
}

/**
 * Actions Column Config
 */
export interface ActionsColumnConfig {
  /**
   * Label
   *
   * @type {string}
   */
  label: string;

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
   * Alignment
   *
   * @type {ColumnAlignment}
   */
  alignment: ColumnAlignment;

  /**
   * Font size
   *
   * @type {ColumnHeaderFontSize}
   */
  fontSize: ColumnHeaderFontSize;
}

/**
 * Scroll To Row Position
 */
export enum ScrollToRowPosition {
  NONE = '',
  START = 'start',
  CENTER = 'center',
  END = 'end',
}

/**
 * Row Highlight Config
 */
export interface RowHighlightConfig {
  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled: boolean;

  /**
   * Column Id
   *
   * @type {string}
   */
  columnId: string;

  /**
   * Variable to get highlighted state
   *
   * @type {string}
   */
  variable: string;

  /**
   * Background Color
   *
   * @type {string}
   */
  backgroundColor?: string;

  /**
   * Scroll To
   *
   * @type {ScrollToRowPosition}
   */
  scrollTo: ScrollToRowPosition;

  /**
   * Smooth scroll
   *
   * @type {boolean}
   */
  smooth: boolean;
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

  /**
   * Add Row
   *
   * @type {TableOperationConfig}
   */
  addRow: TableOperationConfig;

  /**
   * Delete Row
   *
   * @type {TableOperationConfig}
   */
  deleteRow: TableOperationConfig;

  /**
   * Actions Column Config
   *
   * @type {ActionsColumnConfig}
   */
  actionsColumnConfig: ActionsColumnConfig;

  /**
   * Row Highlight
   *
   * @type {RowHighlightConfig}
   */
  rowHighlight: RowHighlightConfig;

  /**
   * Striped rows
   *
   * @type {boolean}
   */
  stripedRows: boolean;

  /**
   * Highlights row on hover
   *
   * @type {boolean}
   */
  highlightRowsOnHover: boolean;
}

/**
 * External Export Config
 */
export interface ExternalExportConfig {
  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled: boolean;

  /**
   * Request
   *
   * @type {TableRequestConfig}
   */
  request: TableRequestConfig;
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

  /**
   * Toolbar buttons alignment
   *
   * @type {string}
   */
  alignment?: 'left' | 'right';

  /**
   * Toolbar download formats
   *
   * @type {ExportFormatType[]}
   */
  exportFormats: ExportFormatType[];
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
   * Column UI manager
   *
   * @type {boolean}
   */
  isColumnManagerAvailable: boolean;

  /**
   * Show Custom Icons in Column Manager
   *
   * @type {boolean}
   */
  isColumnManagerShowCustomIcon: boolean;

  /**
   * Column Manager Native Icon
   *
   * @type {IconName}
   */
  columnManagerNativeIcon: IconName;

  /**
   * Column Manager Custom Icon
   *
   * @type {string}
   */
  columnManagerCustomIcon: string;

  /**
   * Filter UI manager
   *
   * @type {boolean}
   */
  showFiltersInColumnManager: boolean;

  /**
   * Sorting UI manager
   *
   * @type {boolean}
   */
  showSortingInColumnManager: boolean;

  /**
   * Save user Preference
   *
   * @type {boolean}
   */
  saveUserPreference: boolean;

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

  /**
   * external export config
   *
   * @type {ExternalExportConfig}
   */
  externalExport: ExternalExportConfig;
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
   * Add Row Editable
   *
   * @type {boolean}
   */
  addRowEditable: boolean;

  /**
   * Add Row Editor
   *
   * @type {ColumnEditorControlOptions}
   */
  addRowEditor?: ColumnEditorControlOptions;

  /**
   * Nested Object Options
   *
   * @type {NestedObjectControlOptions}
   */
  nestedObjectOptions?: NestedObjectControlOptions;

  /**
   * Scale algorithm
   *
   * @type {ImageScale}
   */
  scale: ImageScale;

  /**
   * Background Row Field
   *
   * @type {Field | null}
   */
  backgroundRowField: Field | null;
}

/**
 * Export format type
 */
export enum ExportFormatType {
  CSV = 'csv',
  XLSX = 'xlsx',
}

/**
 * Toolbar buttons Alignment
 */
export enum ToolbarButtonsAlignment {
  LEFT = 'left',
  RIGHT = 'right',
}

export type AdvancedSettings = {
  /**
   * Is column manager available
   *
   * @type {boolean}
   */
  isColumnManagerAvailable: boolean;

  /**
   * Show columns in UI manager
   *
   * @type {boolean}
   */
  showFiltersInColumnManager: boolean;

  /**
   * Show sort in UI manager
   *
   * @type {boolean}
   */
  showSortInColumnManager: boolean;

  /**
   * Save user preference
   *
   * @type {boolean}
   */
  saveUserPreference: boolean;
};
