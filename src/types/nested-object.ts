import { PanelData } from '@grafana/data';
// eslint-disable-next-line @typescript-eslint/naming-convention
import React from 'react';

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
}

/**
 * Nested Object Control Card
 */
interface NestedObjectControlCardItem {
  /**
   * ID
   *
   * @type {unknown}
   */
  id: unknown;

  /**
   * Title
   *
   * @type {string}
   */
  title: string;
}

/**
 * Nested Object Control Cards Options
 */
interface NestedObjectControlCardsOptions {
  /**
   * Items
   *
   * @type {NestedObjectControlCardItem}
   */
  items: NestedObjectControlCardItem;
}

/**
 * Nested Object Editor Config
 */
export type NestedObjectEditorConfig = { type: NestedObjectType.CARDS } & NestedObjectEditorCardsOptions;

/**
 * Nested Object Control Options
 */
export type NestedObjectControlOptions = {
  type: NestedObjectType.CARDS;
} & NestedObjectControlCardsOptions;

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
 * Nested Object Editor Registry Item
 */
export interface NestedObjectEditorRegistryItem<TType extends NestedObjectType> {
  id: TType;
  editor: React.FC<{
    value: NestedObjectEditorConfig & { type: TType };
    onChange: (value: NestedObjectEditorConfig & { type: TType }) => void;
  }>;
  control: React.FC<{
    config: NestedObjectControlOptions & { type: TType };
    data: Array<Record<string, unknown>>;
  }>;
  getControlOptions: (params: {
    config: NestedObjectEditorConfig & { type: TType };
    data: PanelData;
  }) => NestedObjectControlOptions & { type: TType };
}
