import { CurrentUserDTO, DataFrame } from '@grafana/data';

import { ColumnEditConfig, PermissionMode } from '@/types';

import { getFieldBySource } from './group';

/**
 * Check Org User Role
 */
export const checkEditPermissionByOrgUserRole = (editConfig: ColumnEditConfig, user: CurrentUserDTO): boolean => {
  return editConfig.permission.userRole.includes(user.orgRole);
};

/**
 * Check Query Field
 */
export const checkEditPermissionByQueryField = (editConfig: ColumnEditConfig, series: DataFrame[]): boolean => {
  /**
   * No field source
   */
  if (!editConfig.permission.field) {
    return false;
  }

  const field = getFieldBySource(series, editConfig.permission.field);

  /**
   * No Field
   */
  if (!field) {
    return false;
  }

  return !!field.values[field.values.length - 1];
};

/**
 * Check if column editable
 */
export const checkIfColumnEditable = (
  editConfig: ColumnEditConfig,
  { series, user }: { series: DataFrame[]; user: CurrentUserDTO }
): boolean => {
  /**
   * Not Editable
   */
  if (!editConfig.enabled) {
    return false;
  }

  /**
   * Check Edit Permission
   */
  switch (editConfig.permission.mode) {
    case PermissionMode.ALLOWED: {
      return true;
    }
    case PermissionMode.USER_ROLE: {
      return checkEditPermissionByOrgUserRole(editConfig, user);
    }
    case PermissionMode.QUERY: {
      return checkEditPermissionByQueryField(editConfig, series);
    }
  }
};
