import { ColumnEditConfig } from '@/types';
import { CurrentUserDTO } from '@grafana/data';

/**
 * Check Org User Role
 */
export const checkEditPermissionByOrgUserRole = (editConfig: ColumnEditConfig, user: CurrentUserDTO): boolean => {
  return editConfig.permission.userRole.includes(user.orgRole);
};
