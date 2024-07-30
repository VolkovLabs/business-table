/**
 * Column Mode
 */
export enum ColumnMode {
  AUTO = 'auto',
  MANUAL = 'manual',
}

/**
 * Field Source
 */
export interface FieldSource {
  /**
   * Ref ID
   *
   * @type {string}
   */
  refId?: string;

  /**
   * Name
   *
   * @type {string}
   */
  name: string;
}

/**
 * Cell Type
 */
export enum CellType {
  AUTO = 'auto',
  COLORED_TEXT = 'coloredText',
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
 * Field Settings
 */
export interface FieldSettings {
  /**
   * Cell Options
   *
   * @type {CellOptions}
   */
  cellOptions: CellOptions;
}

/**
 * Column Options
 */
export interface ColumnOptions {
  /**
   * ID
   *
   * @type {string}
   */
  id: string;

  /**
   * Label
   *
   * @type {string}
   */
  label: string;

  /**
   * Field
   *
   * @type {FieldSource}
   */
  field?: FieldSource;
}

/**
 * Options
 */
export interface PanelOptions {
  /**
   * Column Mode
   *
   * @type {ColumnMode}
   */
  columnMode: ColumnMode;

  /**
   * Columns
   *
   * @type {ColumnOptions[]}
   */
  columns: ColumnOptions[];
}
