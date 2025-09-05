import { InlineField, Input } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { EditorProps, TableRequestMessagesConfig } from '@/types';

/**
 * Properties
 */
interface Props extends EditorProps<TableRequestMessagesConfig | undefined> {}

/**
 * Test Ids
 */
const testIds = TEST_IDS.customMessagesEditor;

/**
 * Custom messages Editor
 */
export const CustomMessagesEditor: React.FC<Props> = ({ value, onChange }) => {
  return (
    <>
      <InlineField label="Confirm Modal Title" grow={true} labelWidth={25}>
        <Input
          value={value?.confirmationTitle}
          placeholder="Delete Row"
          onChange={(event) =>
            onChange({
              ...value,
              confirmationTitle: event.currentTarget.value,
            })
          }
          {...testIds.fieldTitle.apply()}
        />
      </InlineField>
      <InlineField label="Confirm Modal Message" grow={true} labelWidth={25}>
        <Input
          value={value?.confirmationMessage}
          placeholder="Please confirm to delete row"
          onChange={(event) =>
            onChange({
              ...value,
              confirmationMessage: event.currentTarget.value,
            })
          }
          {...testIds.fieldMessage.apply()}
        />
      </InlineField>
      <InlineField label="Notify Message" grow={true} labelWidth={25}>
        <Input
          value={value?.notifyMessage}
          placeholder="Row deleted successfully."
          onChange={(event) =>
            onChange({
              ...value,
              notifyMessage: event.currentTarget.value,
            })
          }
          {...testIds.fieldNotify.apply()}
        />
      </InlineField>
    </>
  );
};
