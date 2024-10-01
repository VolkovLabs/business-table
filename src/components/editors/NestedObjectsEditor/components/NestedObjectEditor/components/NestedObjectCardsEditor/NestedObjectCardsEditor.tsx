import { Card, InlineField, Input, RadioButtonGroup } from '@grafana/ui';
import React from 'react';

/**
 * Note: using @/components here causes cycle dependencies
 * so /ui in the end
 */
import { FieldsGroup } from '@/components/ui';
import { TEST_IDS } from '@/constants';
import { EditorProps, NestedObjectCardsDisplay, NestedObjectEditorConfig, NestedObjectType } from '@/types';

/**
 * Properties
 */
interface Props extends EditorProps<NestedObjectEditorConfig & { type: NestedObjectType.CARDS }> {}

/**
 * Test Ids
 */
const testIds = TEST_IDS.nestedObjectCardsEditor;

/**
 * Display Options
 */
const displayOptions = [
  {
    value: NestedObjectCardsDisplay.FIRST,
    label: '',
    icon: 'sort-amount-down',
    description: 'Show First',
    ariaLabel: testIds.option.selector(NestedObjectCardsDisplay.FIRST),
  },
  {
    value: NestedObjectCardsDisplay.NONE,
    label: 'None',
    ariaLabel: testIds.option.selector(NestedObjectCardsDisplay.NONE),
  },
  {
    value: NestedObjectCardsDisplay.LAST,
    label: '',
    icon: 'sort-amount-up',
    description: 'Show Latest',
    ariaLabel: testIds.option.selector(NestedObjectCardsDisplay.LAST),
  },
];

/**
 * Nested Object Cards Editor
 */
export const NestedObjectCardsEditor: React.FC<Props> = ({ value, onChange }) => {
  return (
    <>
      <FieldsGroup label="Data Settings">
        <InlineField label="Id Field" grow={true}>
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
      </FieldsGroup>
      <FieldsGroup label="View">
        <InlineField label="Display In Table" grow={true} {...testIds.fieldDisplay.apply()}>
          <RadioButtonGroup
            options={displayOptions}
            value={value.display}
            onChange={(display) => {
              onChange({
                ...value,
                display,
              });
            }}
          />
        </InlineField>
        {(value.display === NestedObjectCardsDisplay.FIRST || value.display === NestedObjectCardsDisplay.LAST) && (
          <InlineField label="Display Count">
            <Input
              placeholder="All"
              value={value.displayCount || ''}
              onChange={(event) => {
                const displayCount = Number(event.currentTarget.value);

                onChange({
                  ...value,
                  displayCount: displayCount || null,
                });
              }}
              {...testIds.fieldDisplayCount.apply()}
            />
          </InlineField>
        )}
      </FieldsGroup>
    </>
  );
};
