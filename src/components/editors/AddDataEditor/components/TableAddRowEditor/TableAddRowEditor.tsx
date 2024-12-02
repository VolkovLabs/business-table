import { DataFrame } from '@grafana/data';
import { Alert, InlineSwitch, Label, Tag, useStyles2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useState } from 'react';

import { CollapseTitle, EditableColumnEditor, FieldsGroup, PermissionEditor, RequestEditor } from '@/components';
import { TEST_IDS } from '@/constants';
import { CellType, ColumnConfig, TableConfig } from '@/types';
import { getFieldKey } from '@/utils';

import { getStyles } from './TableAddRowEditor.styles';

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
export const testIds = TEST_IDS.tableAddRowEditor;

/**
 * Table Add Row Editor
 */
export const TableAddRowEditor: React.FC<Props> = ({ value, onChange, data }) => {
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

  return (
    <>
      {!value.showHeader && (
        <Alert severity="info" title="Unavailable with hidden table header" {...testIds.disabledHeaderMessage.apply()}>
          Please enable header to allow to add rows.
        </Alert>
      )}
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
                      value={item.newRowEdit.enabled}
                      label="Editable"
                      transparent={true}
                      onChange={(event) => {
                        onChangeItem({
                          ...item,
                          newRowEdit: {
                            ...item.newRowEdit,
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
                      disabled={item.type === CellType.NESTED_OBJECTS}
                      {...testIds.fieldEditQuickEnabled.apply(getFieldKey(item.field))}
                    />
                    {item.newRowEdit.enabled && <Tag name={item.newRowEdit.editor.type} />}
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
                isExpandDisabled={!item.newRowEdit.enabled}
              >
                <>
                  {item.newRowEdit.enabled && (
                    <FieldsGroup label="Editor">
                      <EditableColumnEditor
                        value={item.newRowEdit.editor}
                        onChange={(editor) => {
                          onChangeItem({
                            ...item,
                            newRowEdit: {
                              ...item.newRowEdit,
                              editor,
                            },
                          });
                        }}
                        data={data}
                      />
                    </FieldsGroup>
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
      <FieldsGroup label="Permission">
        <PermissionEditor
          data={data}
          value={value.addRow.permission}
          onChange={(permission) => {
            onChange({
              ...value,
              addRow: {
                ...value.addRow,
                permission,
              },
            });
          }}
        />
      </FieldsGroup>
      <Collapse
        title="Add Request"
        isOpen={expanded.request}
        onToggle={(isOpen) => {
          setExpanded({
            ...expanded,
            request: isOpen,
          });
        }}
        headerTestId={testIds.requestSectionHeader.selector()}
        contentTestId={testIds.requestSectionContent.selector()}
      >
        <RequestEditor
          value={value.addRow.request}
          onChange={(request) => {
            onChange({
              ...value,
              addRow: {
                ...value.addRow,
                request,
              },
            });
          }}
          queryEditorDescription="New row is placed in variable `${payload}`"
        />
      </Collapse>
    </>
  );
};
