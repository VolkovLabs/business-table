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
 * Options
 */
export interface PanelOptions {}
