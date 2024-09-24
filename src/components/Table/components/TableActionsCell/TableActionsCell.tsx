import { dateTimeFormat } from '@grafana/data';
import { Card, Drawer, IconButton, Stack } from '@grafana/ui';
import { CellContext, Row } from '@tanstack/react-table';
import React, { useState } from 'react';

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
  /**
   * Comments
   */
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  return !isEditing ? (
    <Stack gap={0.5}>
      <IconButton
        name="pen"
        aria-label="Edit"
        onClick={() => onStartEdit?.(row)}
        disabled={isSaving}
        tooltip="Edit row"
        {...TEST_IDS.tableActionsCell.buttonStartEdit.apply()}
      />
      <IconButton
        name="comments-alt"
        aria-label="Comments"
        tooltip="3 Comments"
        variant="primary"
        onClick={() => setIsCommentsOpen(true)}
      />
      {isCommentsOpen && (
        <Drawer onClose={() => setIsCommentsOpen(false)} title="Comments">
          {[
            { time: new Date().toISOString(), title: 'Hello', body: 'Hello world!' },
            { time: new Date().toISOString(), title: 'Bye', body: 'Comment description' },
          ].map((item) => (
            <Card key={item.time}>
              <Card.Heading>{item.title}</Card.Heading>
              <Card.Meta>{dateTimeFormat(item.time)}</Card.Meta>
              <Card.Description>{item.body}</Card.Description>
              <Card.SecondaryActions>
                <IconButton name="pen" aria-label="Edit" />
                <IconButton name="trash-alt" aria-label="Delete" />
              </Card.SecondaryActions>
            </Card>
          ))}
        </Drawer>
      )}
    </Stack>
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
