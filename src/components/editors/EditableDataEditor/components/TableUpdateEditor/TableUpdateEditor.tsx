import { DataFrame } from '@grafana/data';
import { Alert, InlineSwitch, Label, Tag, useStyles2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useMemo, useState } from 'react';

import { CollapseTitle, EditableColumnEditor, FieldsGroup, PermissionEditor, RequestEditor } from '@/components';
import { TEST_IDS } from '@/constants';
import { ColumnConfig, TableConfig } from '@/types';
import { getFieldKey } from '@/utils';

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
                        <PermissionEditor
                          data={data}
                          value={item.edit.permission}
                          onChange={(permission) => {
                            onChangeItem({
                              ...item,
                              edit: {
                                ...item.edit,
                                permission,
                              },
                            });
                          }}
                        />
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
            <RequestEditor
              value={value.update}
              onChange={(update) => {
                onChange({
                  ...value,
                  update,
                });
              }}
              queryEditorDescription="Updated row is placed in variable `${payload}`"
            />
          </Collapse>
        </>
      )}
    </>
  );
};
