import { Card, InlineField, Input } from '@grafana/ui';
import React from 'react';

import { NestedObjectType } from '@/types';
import {
  createNestedObjectEditorRegistryItem,
  createNestedObjectEditorsRegistry,
  NestedObjectCardMapper,
} from '@/utils';

import { NestedObjectCardsControl } from './components';

/**
 * Nested Object Editors Registry
 */
export const nestedObjectEditorsRegistry = createNestedObjectEditorsRegistry([
  createNestedObjectEditorRegistryItem({
    id: NestedObjectType.CARDS,
    editor: ({ value, onChange }) => {
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
              />
            </Card.Description>
          </Card>
        </>
      );
    },
    control: NestedObjectCardsControl,
    getControlOptions: (params) => ({
      ...params,
      type: params.config.type,
      isLoading: params.isLoading,
      mapper: new NestedObjectCardMapper(params.config),
    }),
  }),
]);
