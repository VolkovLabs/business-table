import { StandardEditorProps } from '@grafana/data';
import { InlineField, InlineSwitch } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useState } from 'react';

import { FieldsGroup, RequestEditor } from '@/components';
import { TEST_IDS } from '@/constants';
import { ExternalExportConfig, PanelOptions } from '@/types';

/**
 * Properties
 */
type Props = StandardEditorProps<ExternalExportConfig, null, PanelOptions>;

/**
 * Test ids
 */
export const editorTestIds = TEST_IDS.externalExportEditor;

/**
 * External export Editor
 */
export const ExternalExportEditor: React.FC<Props> = ({ value, onChange }) => {
  /**
   * Expanded State
   */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <FieldsGroup label="External export">
      <InlineField label="Enable">
        <InlineSwitch
          value={value?.enabled ?? false}
          onChange={(event) =>
            onChange({
              ...value,
              enabled: event.currentTarget.checked,
            })
          }
          {...editorTestIds.fieldEnabled.apply()}
        />
      </InlineField>

      {value?.enabled && (
        <Collapse
          title="Request"
          isOpen={expanded.request}
          onToggle={(isOpen) => {
            setExpanded({
              ...expanded,
              request: isOpen,
            });
          }}
          headerTestId={editorTestIds.requestSectionHeader.selector()}
          contentTestId={editorTestIds.requestSectionContent.selector()}
        >
          <RequestEditor
            value={
              value?.request ?? {
                datasource: '',
                payload: {},
              }
            }
            onChange={(request) => {
              onChange({
                ...value,
                request: request,
              });
            }}
            queryEditorDescription="Table data placed in variable `${payload}`"
          />
        </Collapse>
      )}
    </FieldsGroup>
  );
};
