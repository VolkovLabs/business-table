import { DataFrame, FieldType, OrgRole } from '@grafana/data';
import { InlineField, Select } from '@grafana/ui';
import React from 'react';

import { FieldPicker } from '@/components';
import { TEST_IDS } from '@/constants';
import { EditorProps, PermissionConfig, PermissionMode } from '@/types';
import { cleanPayloadObject } from '@/utils';

/**
 * Properties
 */
interface Props extends EditorProps<PermissionConfig> {
  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];
}

/**
 * Test Ids
 */
const testIds = TEST_IDS.permissionEditor;

/**
 * Permission Mode Options
 */
const permissionModeOptions = [
  {
    value: PermissionMode.ALLOWED,
    label: 'Always Allowed',
  },
  {
    value: PermissionMode.USER_ROLE,
    label: 'By Org User Role',
  },
  {
    value: PermissionMode.QUERY,
    label: 'By Backend',
  },
];

/**
 * User Org Role Options
 */
const userOrgRoleOptions = Object.values(OrgRole).map((role) => ({
  value: role,
  label: role,
}));

/**
 * Permission Editor
 */
export const PermissionEditor: React.FC<Props> = ({ value, onChange, data }) => {
  return (
    <>
      <InlineField label="Check" grow={true}>
        <Select
          value={value.mode}
          onChange={(event) => {
            onChange({
              ...value,
              mode: event.value!,
            });
          }}
          options={permissionModeOptions}
          {...testIds.fieldMode.apply()}
        />
      </InlineField>
      {value.mode === PermissionMode.USER_ROLE && (
        <InlineField label="User Role" grow={true}>
          <Select
            value={value.userRole}
            onChange={(event) => {
              const values = Array.isArray(event) ? event : [event];

              onChange({
                ...value,
                userRole: values.map((item) => item.value),
              });
            }}
            options={userOrgRoleOptions}
            isMulti={true}
            isClearable={true}
            placeholder="Allowed Org User Role"
            {...testIds.fieldOrgRole.apply()}
          />
        </InlineField>
      )}
      {value.mode === PermissionMode.QUERY && (
        <InlineField
          label="Field"
          tooltip="Field with boolean value to allow/disallow operation. Last value will be used if several values."
          grow={true}
        >
          <FieldPicker
            value={value.field}
            onChange={(field) => {
              onChange(
                cleanPayloadObject({
                  ...value,
                  field,
                })
              );
            }}
            data={data}
            includeTypes={[FieldType.boolean]}
            isClearable={true}
            {...testIds.fieldPicker.apply()}
          />
        </InlineField>
      )}
    </>
  );
};
