import { PanelData } from '@grafana/data';
// eslint-disable-next-line @typescript-eslint/naming-convention
import React from 'react';

import { NestedObjectCardMapper } from '@/utils';

import { TableRequestConfig } from './panel';
import { PermissionConfig } from './permission';

/**
 * Nested Object Type
 */
export enum NestedObjectType {
  CARDS = 'cards',
}

/**
 * Nested Object Operation Config
 */
export interface NestedObjectOperationConfig {
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
 * Editor Cards Options
 */
interface NestedObjectEditorCardsOptions {
  /**
   * ID Field
   *
   * @type {name}
   */
  id: string;

  /**
   * Title
   *
   * @type {string}
   */
  title: string;

  /**
   * Body
   *
   * @type {string}
   */
  body: string;

  /**
   * Time
   *
   * @type {string}
   */
  time: string;

  /**
   * Author
   *
   * @type {string}
   */
  author: string;
}

/**
 * Nested Object Operation Options
 */
interface NestedObjectControlOperationOptions {
  /**
   * Enabled
   *
   * @type {boolean};
   */
  enabled: boolean;

  /**
   * Request
   */
  request?: TableRequestConfig;
}

/**
 * Nested Object Options
 */
interface NestedObjectControlBaseOptions {
  /**
   * Header
   *
   * @type {string}
   */
  header: string;

  /**
   * Is Loading
   *
   * @type {boolean}
   */
  isLoading: boolean;

  /**
   * Operations
   */
  operations: {
    /**
     * Add
     *
     * @type {NestedObjectControlOperationOptions}
     */
    add: NestedObjectControlOperationOptions;

    /**
     * Update
     *
     * @type {NestedObjectControlOperationOptions}
     */
    update: NestedObjectControlOperationOptions;

    /**
     * Delete
     *
     * @type {NestedObjectControlOperationOptions}
     */
    delete: NestedObjectControlOperationOptions;
  };
}

/**
 * Nested Object Control Cards Options
 */
interface NestedObjectControlCardsOptions {
  /**
   * Mapper
   *
   * @type {NestedObjectCardMapper}
   */
  mapper: NestedObjectCardMapper;
}

/**
 * Nested Object Editor Config
 */
export type NestedObjectEditorConfig = { type: NestedObjectType.CARDS } & NestedObjectEditorCardsOptions;

/**
 * Nested Object Control Options
 */
export type NestedObjectControlOptions = NestedObjectControlBaseOptions &
  ({
    type: NestedObjectType.CARDS;
  } & NestedObjectControlCardsOptions);

/**
 * Nested Object Config
 */
export interface NestedObjectConfig {
  /**
   * ID
   *
   * @type {string}
   */
  id: string;

  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Type
   *
   * @type {NestedObjectType}
   */
  type: NestedObjectType;

  /**
   * Get
   *
   * @type {TableRequestConfig}
   */
  get: TableRequestConfig;

  /**
   * Add
   *
   * @type {NestedObjectOperationConfig}
   */
  add?: NestedObjectOperationConfig;

  /**
   * Update
   *
   * @type {NestedObjectOperationConfig}
   */
  update?: NestedObjectOperationConfig;

  /**
   * Delete
   *
   * @type {NestedObjectOperationConfig}
   */
  delete?: NestedObjectOperationConfig;

  /**
   * Editor
   *
   * @type {NestedObjectEditorConfig}
   */
  editor: NestedObjectEditorConfig;
}

/**
 * Nested Object Control Props
 */
export interface NestedObjectControlProps<TType extends NestedObjectType> {
  options: NestedObjectControlOptions & { type: TType };
  value: Array<Record<string, unknown>>;
  row: unknown;
}

/**
 * Nested Object Editor Registry Item
 */
export interface NestedObjectEditorRegistryItem<TType extends NestedObjectType> {
  id: TType;
  editor: React.FC<{
    value: NestedObjectEditorConfig & { type: TType };
    onChange: (value: NestedObjectEditorConfig & { type: TType }) => void;
  }>;
  control: React.FC<NestedObjectControlProps<TType>>;
  getControlOptions: (
    params: {
      config: NestedObjectEditorConfig & { type: TType };
      data: PanelData;
    } & NestedObjectControlBaseOptions
  ) => NestedObjectControlOptions & { type: TType };
}

/**
 * Nested Object Item Payload
 */
export interface NestedObjectItemPayload {
  /**
   * ID
   *
   * @type {string | number}
   */
  id?: string | number;

  /**
   * Title
   *
   * @type {string}
   */
  title?: string;

  /**
   * Body
   *
   * @type {string}
   */
  body?: string;

  /**
   * Author
   *
   * @type {string | number}
   */
  author?: string | number;

  /**
   * Time
   *
   * @type {string | number}
   */
  time?: string | number;
}
