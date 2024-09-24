import { PermissionConfig } from '@/types/permission';

import { TableRequestConfig } from './panel';

/**
 * Nested Object Type
 */
export enum NestedObjectType {
  COMMENTS = 'comments',
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
}
