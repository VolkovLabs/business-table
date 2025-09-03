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
      <InlineField
        label="Confirm modal Title"
        grow={true}
        labelWidth={20}
        tooltip="Leave empty to use the default message."
      >
        <Input
          value={value?.confirmationTitle}
          onChange={(event) =>
            onChange({
              ...value,
              confirmationTitle: event.currentTarget.value,
            })
          }
          {...testIds.fieldTitle.apply()}
        />
      </InlineField>
      <InlineField
        label="Confirm modal message"
        grow={true}
        labelWidth={20}
        tooltip="Leave empty to use the default message."
      >
        <Input
          value={value?.confirmationMessage}
          onChange={(event) =>
            onChange({
              ...value,
              confirmationMessage: event.currentTarget.value,
            })
          }
          {...testIds.fieldMessage.apply()}
        />
      </InlineField>
      <InlineField label="Notify message" grow={true} labelWidth={20} tooltip="Leave empty to use the default message.">
        <Input
          value={value?.notifyMessage}
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
