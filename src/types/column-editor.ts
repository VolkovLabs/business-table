import { SelectableValue } from '@grafana/data';

/**
 * Column Editor Type
 */
export enum ColumnEditorType {
  STRING = 'string',
  NUMBER = 'number',
  SELECT = 'select',
  DATETIME = 'datetime',
}

/**
 * Editor Number Options
 */
interface EditorNumberOptions {
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
}

/**
 * Query Options Mapper
 */
export interface QueryOptionsMapper {
  /**
   * Source
   *
   * @type {number}
   */
  source: string | number;

  /**
   * Value Field
   *
   * @type {string}
   */
  value: string;

  /**
   * Label Field
   *
   * @type {string}
   */
  label: string | null;
}

/**
 * Editor Select Options
 */
interface EditorSelectOptions {
  /**
   * Query Options
   *
   * @type {QueryOptionsMapper}
   */
  queryOptions?: QueryOptionsMapper;
}

interface EditorDatetimeOptions {
  /**
   * Min Date
   *
   * @type {string}
   */
  min?: string;

  /**
   * Max Date
   *
   * @type {string}
   */
  max?: string;
}

/**
 * Column Editor Config
 */
export type ColumnEditorConfig =
  | { type: ColumnEditorType.STRING }
  | ({ type: ColumnEditorType.NUMBER } & EditorNumberOptions)
  | ({ type: ColumnEditorType.SELECT } & EditorSelectOptions)
  | ({ type: ColumnEditorType.DATETIME } & EditorDatetimeOptions);

/**
 * Column Editor Control Options
 */
export type ColumnEditorControlOptions =
  | {
      type: ColumnEditorType.STRING;
    }
  | ({ type: ColumnEditorType.NUMBER } & EditorNumberOptions)
  | ({ type: ColumnEditorType.DATETIME } & EditorDatetimeOptions)
  | ({ type: ColumnEditorType.SELECT } & { options: SelectableValue[] });
