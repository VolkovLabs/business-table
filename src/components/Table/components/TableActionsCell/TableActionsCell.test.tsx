import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { TableActionsCell } from './TableActionsCell';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TableActionsCell>;

describe('TableActionsCell', () => {
  /**
   * Actions
   */
  const onStartEdit = jest.fn();
  const onCancelEdit = jest.fn();
  const onSaveEdit = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.tableActionsCell);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <TableActionsCell onStartEdit={onStartEdit} onCancelEdit={onCancelEdit} onSave={onSaveEdit} {...(props as any)} />
    );
  };

  it('Should allow to start edit', () => {
    const row = { id: '123' };
    render(getComponent({ row: row as any }));

    expect(selectors.buttonStartEdit()).toBeInTheDocument();

    fireEvent.click(selectors.buttonStartEdit());

    expect(onStartEdit).toHaveBeenCalledWith(row);
  });

  it('Should allow to cancel edit', () => {
    const row = { id: '123' };
    render(getComponent({ row: row as any, isEditing: true }));

    expect(selectors.buttonCancel()).toBeInTheDocument();

    fireEvent.click(selectors.buttonCancel());

    expect(onCancelEdit).toHaveBeenCalled();
  });

  it('Should allow to save edit', () => {
    const row = { id: '123' };
    render(getComponent({ row: row as any, isEditing: true }));

    expect(selectors.buttonSave()).toBeInTheDocument();

    fireEvent.click(selectors.buttonSave());

    expect(onSaveEdit).toHaveBeenCalledWith(row);
  });

  it('Should not allow to save edit if already saving', () => {
    const row = { id: '123' };
    render(getComponent({ row: row as any, isEditing: true, isSaving: true }));

    expect(selectors.buttonSave()).toBeInTheDocument();
    expect(selectors.buttonSave()).toBeDisabled();
  });
});
