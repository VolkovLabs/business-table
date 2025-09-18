import { DataFrame, PanelData, SelectableValue } from '@grafana/data';
import { TimeZone } from '@grafana/schema';
// eslint-disable-next-line @typescript-eslint/naming-convention
import React from 'react';

/**
 * Column Editor Type
 */
export enum ColumnEditorType {
  STRING = 'string',
  NUMBER = 'number',
  SELECT = 'select',
  DATETIME = 'datetime',
  DATE = 'date',
  TEXTAREA = 'textarea',
  BOOLEAN = 'boolean',
  FILE = 'file',
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

  /**
   * Custom values
   *
   * @type {boolean}
   */
  customValues?: boolean;
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

  manualInputIsEnabled?: boolean  
  showSeconds?:boolean 
  allowedHours?:number[]
  allowedMinutes?:number[]
  allowedSeconds?:number[]
  timeZone?:TimeZone
  inputFormat?:string  
}

interface EditorDateOptions {
  /**
   * Use local time
   *
   * @type {boolean}
   */
  isUseLocalTime?: boolean;
}

/**
 * File Editor Options
 */
export interface EditorFileOptions {
  /**
   * Accept file types
   *
   * @type {string}
   */
  accept?: string;
  fileExtensions?: string[],
  mimeType?:string[],
  maxSize?: number,
  limit?: number,    
}

/**
 * Column Editor Config
 */
export type ColumnEditorConfig =
  | { type: ColumnEditorType.STRING }
  | { type: ColumnEditorType.TEXTAREA }
  | { type: ColumnEditorType.BOOLEAN }
  | ({ type: ColumnEditorType.NUMBER } & EditorNumberOptions)
  | ({ type: ColumnEditorType.SELECT } & EditorSelectOptions)
  | ({ type: ColumnEditorType.DATETIME } & EditorDatetimeOptions)
  | ({ type: ColumnEditorType.DATE } & EditorDateOptions)
  | ({ type: ColumnEditorType.FILE } & EditorFileOptions);

/**
 * Column Editor Control Options
 */
export type ColumnEditorControlOptions =
  | {
      type: ColumnEditorType.STRING;
    }
  | {
      type: ColumnEditorType.BOOLEAN;
    }
  | { type: ColumnEditorType.TEXTAREA }
  | ({ type: ColumnEditorType.NUMBER } & EditorNumberOptions)
  | ({ type: ColumnEditorType.DATETIME } & EditorDatetimeOptions)
  | ({ type: ColumnEditorType.DATE } & EditorDateOptions)
  | ({ type: ColumnEditorType.SELECT } & { options: SelectableValue[]; customValues: boolean })
  | ({ type: ColumnEditorType.FILE } & EditorFileOptions);

export type ColumnEditorConfigByType<TType extends ColumnEditorType> = Extract<ColumnEditorConfig, { type: TType }>;

export type ColumnEditorControlOptionsByType<TType extends ColumnEditorType> = Extract<
  ColumnEditorControlOptions,
  { type: TType }
>;

/**
 * Editable Column Editor Registry Item
 */
export interface EditableColumnEditorRegistryItem<TType extends ColumnEditorType> {
  id: TType;
  editor: React.FC<{
    value: ColumnEditorConfigByType<TType>;
    onChange: (value: ColumnEditorConfigByType<TType>) => void;
    data: DataFrame[];
  }>;
  control: React.FC<{
    value: any;
    onChange: (value: any) => void;
    config: ColumnEditorControlOptionsByType<TType>;
    isSaving: boolean;
  }>;
  getControlOptions: (params: {
    config: ColumnEditorConfigByType<TType>;
    data: PanelData;
  }) => ColumnEditorControlOptionsByType<TType>;
}
