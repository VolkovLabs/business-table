import { FieldSource } from './frame';

/**
 * Permission Mode
 */
export enum PermissionMode {
  ALLOWED = '',
  QUERY = 'query',
  USER_ROLE = 'userRole',
}

/**
 * Permission Config
 */
export interface PermissionConfig {
  /**
   * Mode
   *
   * @type {PermissionMode}
   */
  mode: PermissionMode;

  /**
   * Field
   *
   * @type {FieldSource}
   */
  field?: FieldSource;

  /**
   * User Role
   *
   * @type {string[]}
   */
  userRole: string[];
}
