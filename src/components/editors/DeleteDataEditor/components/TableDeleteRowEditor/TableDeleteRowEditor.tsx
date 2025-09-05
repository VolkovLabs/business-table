import { DataFrame } from '@grafana/data';
import { Collapse } from '@volkovlabs/components';
import React, { useState } from 'react';

import { CustomMessagesEditor, FieldsGroup, PermissionEditor, RequestEditor } from '@/components';
import { TEST_IDS } from '@/constants';
import { TableConfig } from '@/types';

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
 * Table Delete Row Editor
 */
export const TableDeleteRowEditor: React.FC<Props> = ({ value, onChange, data }) => {
  /**
   * Expanded State
   */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <>
      <FieldsGroup label="Permission">
        <PermissionEditor
          data={data}
          value={value.deleteRow.permission}
          onChange={(permission) => {
            onChange({
              ...value,
              deleteRow: {
                ...value.deleteRow,
                permission,
              },
            });
          }}
        />
      </FieldsGroup>
      <FieldsGroup label="Messages">
        <CustomMessagesEditor
          value={value.deleteRow.messages}
          onChange={(messages) => {
            onChange({
              ...value,
              deleteRow: {
                ...value.deleteRow,
                messages,
              },
            });
          }}
        />
      </FieldsGroup>
      <Collapse
        title="Delete Request"
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
          value={value.deleteRow.request}
          onChange={(request) => {
            onChange({
              ...value,
              deleteRow: {
                ...value.deleteRow,
                request,
              },
            });
          }}
          queryEditorDescription="Row to delete is placed in variable `${payload}`"
        />
      </Collapse>
    </>
  );
};
