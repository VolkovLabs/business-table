import { OrgRole } from '@grafana/data';

import { ColumnEditorType, EditPermissionMode } from '@/types';
import { createColumnConfig } from '@/utils/test';

import { checkEditPermissionByOrgUserRole } from './permission';

describe('Permission utils', () => {
  describe('checkEditPermissionByOrgUserRole', () => {
    it('Should be granted if user role included', () => {
      const columnConfig = createColumnConfig({
        edit: {
          enabled: true,
          permission: {
            mode: EditPermissionMode.USER_ROLE,
            userRole: [OrgRole.Editor, OrgRole.Admin],
            field: {
              source: '',
              name: '',
            },
          },
          editor: {
            type: ColumnEditorType.STRING,
          },
        },
      });

      expect(checkEditPermissionByOrgUserRole(columnConfig.edit, { orgRole: OrgRole.Admin } as any)).toBeTruthy();
      expect(checkEditPermissionByOrgUserRole(columnConfig.edit, { orgRole: OrgRole.Editor } as any)).toBeTruthy();
      expect(checkEditPermissionByOrgUserRole(columnConfig.edit, { orgRole: OrgRole.Viewer } as any)).toBeFalsy();
    });
  });
});
