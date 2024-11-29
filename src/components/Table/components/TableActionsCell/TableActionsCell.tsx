import { IconButton, Stack } from '@grafana/ui';
import { CellContext, Row } from '@tanstack/react-table';
import React from 'react';

import { TEST_IDS } from '@/constants';

/**
 * Properties
 */
interface Props extends CellContext<unknown, unknown> {
  /**
   * Is Editing
   *
   * @type {string}
   */
  isEditing?: boolean;

  /**
   * Start Edit
   */
  onStartEdit?: (row: Row<unknown>) => void;

  /**
   * Cancel Edit
   */
  onCancelEdit?: () => void;

  /**
   * Save
   */
  onSave?: (row: Row<unknown>) => void;

  /**
   * Is Saving
   *
   * @type {boolean}
   */
  isSaving?: boolean;

  /**
   * Is Edit Row Enabled
   *
   * @type {boolean}
   */
  isEditRowEnabled?: boolean;

  /**
   * Is Delete Row Enabled
   *
   * @type {boolean}
   */
  isDeleteRowEnabled?: boolean;

  /**
   * Delete Row
   */
  onDelete?: (row: Row<unknown>) => void;
}

/**
 * Test Ids
 */
export const testIds = TEST_IDS.tableActionsCell;

/**
 * Table Actions Cell
 */
export const TableActionsCell: React.FC<Props> = ({
  row,
  isEditing,
  isEditRowEnabled,
  onStartEdit,
  onCancelEdit,
  onSave,
  isSaving,
  isDeleteRowEnabled,
  onDelete,
}) => {
  if (isEditing) {
    return (
      <Stack gap={0.5}>
        <IconButton
          onClick={() => onSave?.(row)}
          aria-label="Save"
          disabled={isSaving}
          name={isSaving ? 'spinner' : 'save'}
          tooltip="Save"
          variant="primary"
          {...testIds.buttonSave.apply()}
        />
        <IconButton
          variant="secondary"
          onClick={onCancelEdit}
          aria-label="Cancel"
          disabled={isSaving}
          tooltip="Cancel"
          name={'times'}
          {...testIds.buttonCancel.apply()}
        />
      </Stack>
    );
  }

  if (isEditRowEnabled || isDeleteRowEnabled) {
    return (
      <Stack gap={0.5}>
        {isEditRowEnabled && (
          <IconButton
            name="pen"
            aria-label="Edit"
            onClick={() => onStartEdit?.(row)}
            disabled={isSaving}
            tooltip="Edit row"
            {...testIds.buttonStartEdit.apply()}
          />
        )}
        {isDeleteRowEnabled && (
          <IconButton
            name="trash-alt"
            aria-label="Delete"
            tooltip="Delete row"
            onClick={() => onDelete?.(row)}
            {...testIds.buttonDelete.apply()}
          />
        )}
      </Stack>
    );
  }

  return null;
};
