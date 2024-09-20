import { DataFrame, FieldType, OrgRole } from '@grafana/data';
import { Alert, Field, InlineField, InlineSwitch, Label, Select, Tag, useStyles2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useMemo, useState } from 'react';

import {
  CollapseTitle,
  DatasourceEditor,
  DatasourcePayloadEditor,
  EditableColumnEditor,
  FieldPicker,
  FieldsGroup,
} from '@/components';
import { TEST_IDS } from '@/constants';
import { ColumnConfig, EditPermissionMode, TableConfig } from '@/types';
import { cleanPayloadObject, getFieldKey } from '@/utils';

import { getStyles } from './TableUpdateEditor.styles';

/**
 * Value
 */
type Value = TableConfig;

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {Value}
   */
  value: Value;

  /**
   * Change
   */
  onChange: (value: Value) => void;

  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];
}

/**
 * Edit Permission Mode Options
 */
const editPermissionModeOptions = [
  {
    value: EditPermissionMode.ALLOWED,
    label: 'Always Allowed',
  },
  {
    value: EditPermissionMode.USER_ROLE,
    label: 'By Org User Role',
  },
  {
    value: EditPermissionMode.QUERY,
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
 * Test Ids
 */
const testIds = TEST_IDS.tableUpdateEditor;

/**
 * Table Update Editor
 */
export const TableUpdateEditor: React.FC<Props> = ({ value, onChange, data }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Expanded State
   */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /**
   * Change Item
   */
  const onChangeItem = useCallback(
    (updatedItem: ColumnConfig) => {
      onChange({
        ...value,
        items: value.items.map((item) =>
          getFieldKey(item.field) === getFieldKey(updatedItem.field) ? updatedItem : item
        ),
      });
    },
    [onChange, value]
  );

  /**
   * Is Editable Column
   */
  const isEditableColumn = useMemo(() => {
    return value.items.some((item) => item.edit.enabled);
  }, [value.items]);

  return (
    <>
      <Label>Columns</Label>
      <>
        {value.items.length > 0 ? (
          value.items.map((item) => (
            <div key={getFieldKey(item.field)} className={styles.column}>
              <Collapse
                fill="solid"
                isExpandDisabled={!item.edit.enabled}
                title={
                  <CollapseTitle>
                    {item.field.name}
                    <InlineSwitch
                      value={item.edit.enabled}
                      label="Editable"
                      transparent={true}
                      onChange={(event) => {
                        onChangeItem({
                          ...item,
                          edit: {
                            ...item.edit,
                            enabled: event.currentTarget.checked,
                          },
                        });

                        /**
                         * Toggle Expanded State
                         */
                        setExpanded({
                          ...expanded,
                          [getFieldKey(item.field)]: event.currentTarget.checked,
                        });
                      }}
                      {...testIds.fieldEditQuickEnabled.apply(getFieldKey(item.field))}
                    />
                    {item.edit.enabled && <Tag name={item.edit.editor.type} />}
                  </CollapseTitle>
                }
                isOpen={expanded[getFieldKey(item.field)]}
                onToggle={(isOpen) =>
                  setExpanded({
                    ...expanded,
                    [getFieldKey(item.field)]: isOpen,
                  })
                }
                headerTestId={testIds.columnHeader.selector(getFieldKey(item.field))}
                contentTestId={testIds.columnContent.selector(getFieldKey(item.field))}
                isExpandDisabled={!item.edit.enabled}
              >
                <>
                  {item.edit.enabled && (
                    <>
                      <FieldsGroup label="Permission">
                        <InlineField label="Check" grow={true}>
                          <Select
                            value={item.edit.permission.mode}
                            onChange={(event) => {
                              onChangeItem({
                                ...item,
                                edit: {
                                  ...item.edit,
                                  permission: {
                                    ...item.edit.permission,
                                    mode: event.value!,
                                  },
                                },
                              });
                            }}
                            options={editPermissionModeOptions}
                            {...testIds.fieldEditPermissionMode.apply()}
                          />
                        </InlineField>
                        {item.edit.permission.mode === EditPermissionMode.USER_ROLE && (
                          <InlineField label="User Role" grow={true}>
                            <Select
                              value={item.edit.permission.userRole}
                              onChange={(event) => {
                                const values = Array.isArray(event) ? event : [event];

                                onChangeItem({
                                  ...item,
                                  edit: {
                                    ...item.edit,
                                    permission: {
                                      ...item.edit.permission,
                                      userRole: values.map((item) => item.value),
                                    },
                                  },
                                });
                              }}
                              options={userOrgRoleOptions}
                              isMulti={true}
                              isClearable={true}
                              placeholder="Allowed Org User Role"
                              {...testIds.fieldEditPermissionOrgRole.apply()}
                            />
                          </InlineField>
                        )}
                        {item.edit.permission.mode === EditPermissionMode.QUERY && (
                          <InlineField
                            label="Field"
                            tooltip="Field with boolean value to allow/disallow edit. Last value will be used if several values."
                            grow={true}
                          >
                            <FieldPicker
                              value={item.edit.permission.field}
                              onChange={(field) => {
                                onChangeItem({
                                  ...item,
                                  edit: {
                                    ...item.edit,
                                    permission: cleanPayloadObject({
                                      ...item.edit.permission,
                                      field,
                                    }),
                                  },
                                });
                              }}
                              data={data}
                              includeTypes={[FieldType.boolean]}
                              isClearable={true}
                              {...testIds.fieldEditPermissionField.apply()}
                            />
                          </InlineField>
                        )}
                      </FieldsGroup>
                      <FieldsGroup label="Editor">
                        <EditableColumnEditor
                          value={item.edit.editor}
                          onChange={(editor) => {
                            onChangeItem({
                              ...item,
                              edit: {
                                ...item.edit,
                                editor,
                              },
                            });
                          }}
                          data={data}
                        />
                      </FieldsGroup>
                    </>
                  )}
                </>
              </Collapse>
            </div>
          ))
        ) : (
          <Alert severity="info" title="No Columns" {...testIds.noColumnsMessage.apply()}>
            Please add at least one column for table.
          </Alert>
        )}
      </>
      {isEditableColumn && (
        <>
          <Label>Settings</Label>
          <Collapse
            title="Update Request"
            isOpen={expanded.update}
            onToggle={(isOpen) => {
              setExpanded({
                ...expanded,
                update: isOpen,
              });
            }}
            headerTestId={testIds.updateSectionHeader.selector()}
            contentTestId={testIds.updateSectionContent.selector()}
          >
            <>
              <Field label="Data Source">
                <DatasourceEditor
                  value={value.update.datasource}
                  onChange={(datasource) => {
                    onChange({
                      ...value,
                      update: {
                        ...value.update,
                        datasource,
                      },
                    });
                  }}
                />
              </Field>
              {value.update.datasource && (
                <Field label="Query Editor" description="Updated row is placed in variable `${payload}`">
                  <DatasourcePayloadEditor
                    value={value.update.payload}
                    onChange={(payload) => {
                      onChange({
                        ...value,
                        update: {
                          ...value.update,
                          payload: payload as Record<string, unknown>,
                        },
                      });
                    }}
                    datasourceName={value.update.datasource}
                  />
                </Field>
              )}
            </>
          </Collapse>
        </>
      )}
    </>
  );
};
