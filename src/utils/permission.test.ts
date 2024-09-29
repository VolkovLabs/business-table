import { OrgRole, toDataFrame } from '@grafana/data';

import { PermissionMode } from '@/types';
import { createColumnEditConfig, createPermissionConfig } from '@/utils/test';

import { checkEditPermissionByQueryField, checkIfOperationEnabled, checkPermissionByOrgUserRole } from './permission';

describe('Permission utils', () => {
  describe('checkEditPermissionByOrgUserRole', () => {
    it('Should be granted if user role included', () => {
      const permissionConfig = createPermissionConfig({
        mode: PermissionMode.USER_ROLE,
        userRole: [OrgRole.Editor, OrgRole.Admin],
      });

      expect(checkPermissionByOrgUserRole(permissionConfig, { orgRole: OrgRole.Admin } as any)).toBeTruthy();
      expect(checkPermissionByOrgUserRole(permissionConfig, { orgRole: OrgRole.Editor } as any)).toBeTruthy();
      expect(checkPermissionByOrgUserRole(permissionConfig, { orgRole: OrgRole.Viewer } as any)).toBeFalsy();
    });
  });

  describe('checkEditPermissionByQueryField', () => {
    it('Should be granted if value is truthy', () => {
      const permissionConfig = createPermissionConfig({
        mode: PermissionMode.USER_ROLE,
        userRole: [],
        field: {
          source: 'A',
          name: 'edit',
        },
      });

      expect(
        checkEditPermissionByQueryField(permissionConfig, [
          toDataFrame({
            refId: 'A',
            fields: [
              {
                name: 'edit',
                values: [true],
              },
            ],
          }),
        ])
      ).toBeTruthy();
      expect(
        checkEditPermissionByQueryField(permissionConfig, [
          toDataFrame({
            refId: 'A',
            fields: [
              {
                name: 'edit',
                values: [false],
              },
            ],
          }),
        ])
      ).toBeFalsy();
      expect(checkEditPermissionByQueryField(permissionConfig, [])).toBeFalsy();
      expect(
        checkEditPermissionByQueryField(
          createPermissionConfig({
            mode: PermissionMode.USER_ROLE,
            userRole: [],
          }),
          []
        )
      ).toBeFalsy();
    });
  });

  describe('checkIfColumnEditable', () => {
    it('Should not allow to edit if disabled', () => {
      expect(
        checkIfOperationEnabled(createColumnEditConfig({ enabled: false }), { series: [], user: {} as any })
      ).toBeFalsy();
    });

    it('Should allow to edit if always allowed', () => {
      expect(
        checkIfOperationEnabled(
          createColumnEditConfig({ enabled: true, permission: { mode: PermissionMode.ALLOWED, userRole: [] } }),
          { series: [], user: {} as any }
        )
      ).toBeTruthy();
    });

    it('Should allow to edit if correct user role', () => {
      expect(
        checkIfOperationEnabled(
          createColumnEditConfig({
            enabled: true,
            permission: { mode: PermissionMode.USER_ROLE, userRole: [OrgRole.Admin] },
          }),
          { series: [], user: { orgRole: OrgRole.Admin } as any }
        )
      ).toBeTruthy();
      expect(
        checkIfOperationEnabled(
          createColumnEditConfig({
            enabled: true,
            permission: { mode: PermissionMode.USER_ROLE, userRole: [OrgRole.Admin] },
          }),
          { series: [], user: { orgRole: OrgRole.Editor } as any }
        )
      ).toBeFalsy();
    });

    it('Should allow to edit if allowed by query', () => {
      expect(
        checkIfOperationEnabled(
          createColumnEditConfig({
            enabled: true,
            permission: { mode: PermissionMode.QUERY, userRole: [], field: { source: 'A', name: 'edit' } },
          }),
          { series: [toDataFrame({ refId: 'A', fields: [{ name: 'edit', values: [true] }] })], user: {} as any }
        )
      ).toBeTruthy();
      expect(
        checkIfOperationEnabled(
          createColumnEditConfig({
            enabled: true,
            permission: { mode: PermissionMode.QUERY, userRole: [], field: { source: 'A', name: 'edit' } },
          }),
          { series: [toDataFrame({ refId: 'A', fields: [{ name: 'edit', values: [false] }] })], user: {} as any }
        )
      ).toBeFalsy();
    });
  });
});
