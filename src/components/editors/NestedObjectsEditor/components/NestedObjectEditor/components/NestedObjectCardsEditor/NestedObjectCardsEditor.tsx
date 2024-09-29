import { Card, InlineField, Input } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { EditorProps, NestedObjectEditorConfig, NestedObjectType } from '@/types';

/**
 * Properties
 */
interface Props extends EditorProps<NestedObjectEditorConfig & { type: NestedObjectType.CARDS }> {}

/**
 * Test Ids
 */
const testIds = TEST_IDS.nestedObjectCardsEditor;

/**
 * Nested Object Cards Editor
 */
export const NestedObjectCardsEditor: React.FC<Props> = ({ value, onChange }) => {
  return (
    <>
      <InlineField label="Id Field">
        <Input
          placeholder="Field Name With Item ID"
          value={value.id}
          onChange={(event) => {
            onChange({
              ...value,
              id: event.currentTarget.value,
            });
          }}
          {...testIds.fieldId.apply()}
        />
      </InlineField>
      <Card>
        <Card.Heading>
          <Input
            placeholder="Title Field"
            value={value.title}
            onChange={(event) => {
              onChange({
                ...value,
                title: event.currentTarget.value,
              });
            }}
            {...testIds.fieldTitle.apply()}
          />
        </Card.Heading>
        <Card.Meta>
          <Input
            placeholder="Time Field"
            value={value.time}
            onChange={(event) => {
              onChange({
                ...value,
                time: event.currentTarget.value,
              });
            }}
            {...testIds.fieldTime.apply()}
          />
          <Input
            placeholder="Author Field"
            value={value.author}
            onChange={(event) => {
              onChange({
                ...value,
                author: event.currentTarget.value,
              });
            }}
            {...testIds.fieldAuthor.apply()}
          />
        </Card.Meta>
        <Card.Description>
          <Input
            placeholder="Description Field"
            value={value.body}
            onChange={(event) => {
              onChange({
                ...value,
                body: event.currentTarget.value,
              });
            }}
            {...testIds.fieldBody.apply()}
          />
        </Card.Description>
      </Card>
    </>
  );
};
