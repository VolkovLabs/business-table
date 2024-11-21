import { DataFrame } from '@grafana/data';
import { InlineField, InlineFieldRow, InlineSwitch } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { EditorProps, TableConfig } from '@/types';

import { ColumnsEditor } from './components';

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
  return (
    <>
    <InlineFieldRow>
      <InlineField label="Show header">
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
    </InlineFieldRow>
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
