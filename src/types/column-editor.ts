import { DataFrame, PanelData, SelectableValue } from '@grafana/data';
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
  TEXTAREA = 'textarea',
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
}

/**
 * Column Editor Config
 */
export type ColumnEditorConfig =
  | { type: ColumnEditorType.STRING }
  | { type: ColumnEditorType.TEXTAREA }
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
  | { type: ColumnEditorType.TEXTAREA }
  | ({ type: ColumnEditorType.NUMBER } & EditorNumberOptions)
  | ({ type: ColumnEditorType.DATETIME } & EditorDatetimeOptions)
  | ({ type: ColumnEditorType.SELECT } & { options: SelectableValue[]; customValues?: boolean });

/**
 * Editable Column Editor Registry Item
 */
export interface EditableColumnEditorRegistryItem<TType extends ColumnEditorType> {
  id: TType;
  editor: React.FC<{
    value: ColumnEditorConfig & { type: TType };
    onChange: (value: ColumnEditorConfig & { type: TType }) => void;
    data: DataFrame[];
  }>;
  control: React.FC<{
    value: unknown;
    onChange: (value: unknown) => void;
    config: ColumnEditorControlOptions & { type: TType };
    isSaving: boolean;
  }>;
  getControlOptions: (params: {
    config: ColumnEditorConfig & { type: TType };
    data: PanelData;
  }) => ColumnEditorControlOptions & { type: TType };
}
