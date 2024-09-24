import { Card, InlineField, Input } from '@grafana/ui';
import React from 'react';

import { NestedObjectType } from '@/types';
import { createNestedObjectEditorRegistryItem, createNestedObjectEditorsRegistry } from '@/utils';

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
          </Card>
        </>
      );
    },
    control: ({ config, data }) => {
      return (
        <>
          {data.map((item, index) => {
            return <div key={index}>{(item as any).title}</div>;
          })}
        </>
      );
    },
    getControlOptions: (params) => ({
      items: [] as any,
      type: params.config.type,
    }),
  }),
]);
