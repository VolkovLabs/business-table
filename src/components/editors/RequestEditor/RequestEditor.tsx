import { Field } from '@grafana/ui';
import React from 'react';

import { DatasourceEditor, DatasourcePayloadEditor } from '@/components';
import { EditorProps, TableRequestConfig } from '@/types';

/**
 * Properties
 */
interface Props extends EditorProps<TableRequestConfig> {
  /**
   * Query Editor Description
   *
   * @type {string}
   */
  queryEditorDescription?: string;
}

/**
 * Request Editor
 */
export const RequestEditor: React.FC<Props> = ({ value, onChange, queryEditorDescription }) => {
  return (
    <>
      <Field label="Data Source">
        <DatasourceEditor
          value={value.datasource}
          onChange={(datasource) => {
            onChange({
              ...value,
              datasource,
            });
          }}
        />
      </Field>
      {value.datasource && (
        <Field label="Query Editor" description={queryEditorDescription}>
          <DatasourcePayloadEditor
            value={value.payload}
            onChange={(payload) => {
              onChange({
                ...value,
                payload: payload as Record<string, unknown>,
              });
            }}
            datasourceUid={value.datasource}
          />
        </Field>
      )}
    </>
  );
};
