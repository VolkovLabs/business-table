import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TableActionsCell, testIds } from './TableActionsCell';

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
  const onDelete = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(testIds);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <TableActionsCell
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
        onSave={onSaveEdit}
        onDelete={onDelete}
        cell={{} as never}
        column={{} as never}
        getValue={jest.fn() as never}
        renderValue={jest.fn() as never}
        row={{} as never}
        table={{} as never}
        isEditing={false}
        isSaving={false}
        isDeleteRowEnabled={false}
        isEditRowEnabled={false}
        {...props}
      />
    );
  };

  it('Should allow to start edit', () => {
    const row = { id: '123' };
    render(getComponent({ row: row as any, isEditRowEnabled: true }));

    expect(selectors.buttonStartEdit()).toBeInTheDocument();

    fireEvent.click(selectors.buttonStartEdit());

    expect(onStartEdit).toHaveBeenCalledWith(row);
  });

  it('Should not allow to start edit if disabled', () => {
    const row = { id: '123' };
    render(getComponent({ row: row as any, isEditRowEnabled: false }));

    expect(selectors.buttonStartEdit(true)).not.toBeInTheDocument();
  });

  it('Should allow to delete', () => {
    const row = { id: '123' };
    render(getComponent({ row: row as any, isDeleteRowEnabled: true }));

    expect(selectors.buttonDelete()).toBeInTheDocument();

    fireEvent.click(selectors.buttonDelete());

    expect(onDelete).toHaveBeenCalledWith(row);
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
