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
}

/**
 * Table Actions Cell
 */
export const TableActionsCell: React.FC<Props> = ({ row, isEditing, onStartEdit, onCancelEdit, onSave, isSaving }) => {
  return !isEditing ? (
    <IconButton
      name="pen"
      aria-label="Edit"
      onClick={() => onStartEdit?.(row)}
      disabled={isSaving}
      tooltip="Edit row"
      {...TEST_IDS.tableActionsCell.buttonStartEdit.apply()}
    />
  ) : (
    <Stack gap={0.5}>
      <IconButton
        onClick={() => onSave?.(row)}
        aria-label="Save"
        disabled={isSaving}
        name={isSaving ? 'spinner' : 'save'}
        tooltip="Save"
        variant="primary"
        {...TEST_IDS.tableActionsCell.buttonSave.apply()}
      />
      <IconButton
        variant="secondary"
        onClick={onCancelEdit}
        aria-label="Cancel"
        disabled={isSaving}
        tooltip="Cancel"
        name={'times'}
        {...TEST_IDS.tableActionsCell.buttonCancel.apply()}
      />
    </Stack>
  );
};
