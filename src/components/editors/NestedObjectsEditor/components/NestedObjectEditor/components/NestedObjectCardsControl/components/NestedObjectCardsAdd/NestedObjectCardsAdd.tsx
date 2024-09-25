import { InterpolateFunction } from '@grafana/data';
import { Button, FieldSet } from '@grafana/ui';
import React, { useState } from 'react';

import { NestedObjectItemPayload } from '@/types';
import { NestedObjectCardMapper } from '@/utils';

import { NestedObjectCardsItem } from '../NestedObjectCardsItem';

/**
 * Properties
 */
interface Props {
  /**
   * Mapper
   *
   * @type {NestedObjectCardMapper}
   */
  mapper: NestedObjectCardMapper;

  /**
   * Add
   */
  onAdd: (value: NestedObjectItemPayload) => Promise<void>;

  /**
   * Replace Variables
   *
   * @type {InterpolateFunction}
   */
  replaceVariables: InterpolateFunction;
}

/**
 * Nested Object Cards Add
 */
export const NestedObjectCardsAdd: React.FC<Props> = ({ mapper, onAdd, replaceVariables }) => {
  /**
   * States
   */
  const [newItem, setNewItem] = useState<NestedObjectItemPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!newItem) {
    return (
      <Button icon="plus-circle" onClick={() => setNewItem(mapper.createNewPayload())}>
        Add
      </Button>
    );
  }

  return (
    <FieldSet label="New">
      <NestedObjectCardsItem
        value={newItem}
        isEditing={true}
        onEdit={async (payload) => {
          if (!payload) {
            setNewItem(null);
            return;
          }

          setIsLoading(true);

          try {
            await onAdd(payload);
            setNewItem(null);
            setIsLoading(false);
          } catch (e) {
            console.error('error', e);
            setIsLoading(false);
          }
        }}
        isEditEnabled={true}
        isDeleteEnabled={false}
        isLoading={isLoading}
        replaceVariables={replaceVariables}
      />
    </FieldSet>
  );
};
