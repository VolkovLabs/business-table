import { DataFrame } from '@grafana/data';
import { InlineField, InlineFieldRow, InlineSwitch } from '@grafana/ui';
import React, { useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { EditorProps, TableConfig } from '@/types';

import { ActionsColumnEditor, ColumnsEditor } from './components';

/**
 * Properties
 */
interface Props extends EditorProps<TableConfig> {
  /**
   * Data
   */
  data: DataFrame[];
}

/**
 * Table Editor
 */
export const TableEditor: React.FC<Props> = ({ value, onChange, data }) => {
  /**
   * Is Table Editable
   */
  const isTableEditable = useMemo(() => {
    const isAddEnable = value.addRow.enabled;
    const isDeleteEnabled = value.deleteRow.enabled;

    const isEditableRows = value.items.some((item) => item.edit.enabled);

    return isAddEnable || isDeleteEnabled || isEditableRows;
  }, [value.addRow.enabled, value.deleteRow.enabled, value.items]);

  return (
    <>
      <InlineFieldRow>
        <InlineField label="Show header" grow={true}>
          <InlineSwitch
            value={value.showHeader}
            onChange={(event) =>
              onChange({
                ...value,
                showHeader: event.currentTarget.checked,
              })
            }
            {...TEST_IDS.tableEditor.fieldShowHeader.apply()}
          />
        </InlineField>
        <InlineField label="Expanded by default" tooltip="Makes all rows expanded or collapsed by default" grow={true}>
          <InlineSwitch
            value={value.expanded}
            onChange={(event) =>
              onChange({
                ...value,
                expanded: event.currentTarget.checked,
              })
            }
            {...TEST_IDS.tableEditor.fieldExpanded.apply()}
          />
        </InlineField>
        <InlineField
          label="Striped rows"
          tooltip="Striped rows do not override existing row or cell background colors"
          grow={true}
        >
          <InlineSwitch
            value={value.stripedRows}
            onChange={(event) =>
              onChange({
                ...value,
                stripedRows: event.currentTarget.checked,
              })
            }
            {...TEST_IDS.tableEditor.fieldStripedRows.apply()}
          />
        </InlineField>
        <InlineField label="Highlight rows on hover" grow={true}>
          <InlineSwitch
            value={value.highlightRowsOnHover}
            onChange={(event) =>
              onChange({
                ...value,
                highlightRowsOnHover: event.currentTarget.checked,
              })
            }
            {...TEST_IDS.tableEditor.fieldHighlightRowsOnHover.apply()}
          />
        </InlineField>
      </InlineFieldRow>
      {isTableEditable && (
        <ActionsColumnEditor
          value={value.actionsColumnConfig}
          onChange={(config) => {
            onChange({
              ...value,
              actionsColumnConfig: config,
            });
          }}
        />
      )}
      <ColumnsEditor
        showTableHeader={value.showHeader}
        name={value.name}
        value={value.items}
        data={data}
        onChange={(items) => {
          onChange({
            ...value,
            items,
          });
        }}
      />
    </>
  );
};
