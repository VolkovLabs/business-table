import { dateTimeFormat, InterpolateFunction } from '@grafana/data';
import { Button, Card, ConfirmModal, IconButton, Input, Stack } from '@grafana/ui';
import { AutosizeCodeEditor } from '@volkovlabs/components';
import React, { useCallback, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { NestedObjectItemPayload } from '@/types';

import { NestedObjectCardContent } from '../NestedObjectCardContent';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {NestedObjectItemPayload}
   */
  value: NestedObjectItemPayload;

  /**
   * Edit Enabled
   *
   * @type {boolean}
   */
  isEditEnabled: boolean;

  /**
   * Delete Enabled
   *
   * @type {boolean}
   */
  isDeleteEnabled: boolean;

  /**
   * Edit
   */
  onEdit: (value: NestedObjectItemPayload | null) => Promise<void>;

  /**
   * Delete
   */
  onDelete?: (value: NestedObjectItemPayload) => Promise<void>;

  /**
   * Is Loading
   *
   * @type {boolean}
   */
  isLoading?: boolean;

  /**
   * Is Editing
   *
   * @type {boolean}
   */
  isEditing?: boolean;

  /**
   * Replace Variables
   *
   * @type {InterpolateFunction}
   */
  replaceVariables: InterpolateFunction;
}

/**
 * Test Ids
 */
const testIds = TEST_IDS.nestedObjectCardsItem;

/**
 * Nested Object Cards Item
 */
export const NestedObjectCardsItem: React.FC<Props> = ({
  value,
  isDeleteEnabled,
  isEditEnabled,
  isEditing: isInitialEditing,
  onEdit,
  replaceVariables,
  isLoading,
  onDelete,
}) => {
  /**
   * States
   */
  const [isEditing, setIsEditing] = useState(isInitialEditing ?? false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localValue, setLocalValue] = useState<NestedObjectItemPayload | null>(isInitialEditing ? value : null);

  /**
   * Current Payload
   */
  const itemPayload = isEditing && localValue ? localValue : value;

  /**
   * Start Edit
   */
  const onStartEdit = useCallback(() => {
    setIsEditing(true);
    setLocalValue(value);
  }, [value]);

  /**
   * Save Edit
   */
  const onSaveEdit = useCallback(async () => {
    try {
      await onEdit(localValue);

      if (!isInitialEditing) {
        setIsEditing(false);
      }
    } catch (e) {}
  }, [isInitialEditing, localValue, onEdit]);

  return (
    <>
      <Card {...testIds.root.apply()} isCompact={true}>
        <Card.Heading {...testIds.root.apply()}>
          {typeof itemPayload.title !== 'undefined' && (
            <>
              {isEditing ? (
                <Input
                  placeholder="Title"
                  value={itemPayload.title}
                  onChange={(event) =>
                    setLocalValue({
                      ...itemPayload,
                      title: event.currentTarget.value,
                    })
                  }
                  {...testIds.fieldTitle.apply()}
                />
              ) : (
                replaceVariables(itemPayload.title)
              )}
            </>
          )}
        </Card.Heading>
        <Card.Meta>
          {itemPayload.time ? dateTimeFormat(itemPayload.time) : ''}
          {typeof itemPayload.author === 'string' ? itemPayload.author : ''}
          {typeof itemPayload.author === 'number' ? itemPayload.author : ''}
        </Card.Meta>
        <Card.Description>
          {typeof itemPayload.body !== 'undefined' && (
            <>
              {isEditing ? (
                <AutosizeCodeEditor
                  value={itemPayload.body.replaceAll('\\n', '\n')}
                  onChange={(body) => {
                    /**
                     * itemPayload is cached here somehow so use value from callback
                     */
                    setLocalValue((current) => ({
                      ...current,
                      body: body.replaceAll('\n', '\\n'),
                    }));
                  }}
                  language="markdown"
                  modalTitle="Body"
                  modalButtonTooltip=""
                  {...testIds.fieldBody.apply()}
                />
              ) : (
                <NestedObjectCardContent text={itemPayload.body} replaceVariables={replaceVariables} />
              )}
            </>
          )}
          {isEditing ? (
            <Stack gap={1}>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setLocalValue(null);
                  onEdit(null);
                }}
                disabled={isLoading}
                {...testIds.buttonCancelEdit.apply()}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={onSaveEdit} disabled={isLoading} {...testIds.buttonSaveEdit.apply()}>
                Save
              </Button>
            </Stack>
          ) : (
            <Stack gap={0.5}>
              {isEditEnabled && (
                <IconButton name="pen" aria-label="Edit" onClick={onStartEdit} {...testIds.buttonStartEdit.apply()} />
              )}
              {isDeleteEnabled && (
                <IconButton
                  name="trash-alt"
                  aria-label="Delete"
                  onClick={() => setIsDeleting(true)}
                  {...testIds.buttonStartDelete.apply()}
                />
              )}
            </Stack>
          )}
        </Card.Description>
      </Card>
      {isDeleting && (
        <ConfirmModal
          isOpen={true}
          title={`Delete ${itemPayload.title ?? itemPayload.body ?? 'Item'}`}
          body="Please confirm to delete"
          confirmText="Confirm"
          onConfirm={() => onDelete?.(itemPayload)}
          onDismiss={() => setIsDeleting(false)}
          {...testIds.modalConfirmDelete.apply()}
        />
      )}
    </>
  );
};
