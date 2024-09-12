import { CurrentUserDTO } from '@grafana/data';

import { ColumnEditConfig } from '@/types';

/**
 * Check Org User Role
 */
export const checkEditPermissionByOrgUserRole = (editConfig: ColumnEditConfig, user: CurrentUserDTO): boolean => {
  return editConfig.permission.userRole.includes(user.orgRole);
};
