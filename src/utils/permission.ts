import { CurrentUserDTO, DataFrame } from '@grafana/data';

import { ColumnEditConfig, NestedObjectOperationConfig, PermissionConfig, PermissionMode } from '@/types';

import { getFieldBySource } from './group';

/**
 * Check Org User Role
 */
export const checkPermissionByOrgUserRole = (permission: PermissionConfig, user: CurrentUserDTO): boolean => {
  return permission.userRole.includes(user.orgRole);
};

/**
 * Check Query Field
 */
export const checkEditPermissionByQueryField = (permission: PermissionConfig, series: DataFrame[]): boolean => {
  /**
   * No field source
   */
  if (!permission.field) {
    return false;
  }

  const field = getFieldBySource(series, permission.field);

  /**
   * No Field
   */
  if (!field) {
    return false;
  }

  return !!field.values[field.values.length - 1];
};

/**
 * Check If Operation Enabled
 */
export const checkIfOperationEnabled = (
  config: ColumnEditConfig | NestedObjectOperationConfig,
  { series, user }: { series: DataFrame[]; user: CurrentUserDTO }
): boolean => {
  /**
   * Not Editable
   */
  if (!config.enabled) {
    return false;
  }

  /**
   * Check Edit Permission
   */
  switch (config.permission.mode) {
    case PermissionMode.ALLOWED: {
      return true;
    }
    case PermissionMode.USER_ROLE: {
      return checkPermissionByOrgUserRole(config.permission, user);
    }
    case PermissionMode.QUERY: {
      return checkEditPermissionByQueryField(config.permission, series);
    }
  }
};
