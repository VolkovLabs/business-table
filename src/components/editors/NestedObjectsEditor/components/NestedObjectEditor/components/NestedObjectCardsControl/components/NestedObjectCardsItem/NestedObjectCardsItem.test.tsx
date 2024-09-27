import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { NestedObjectType } from '@/types';
import { createNestedObjectEditorConfig, NestedObjectCardMapper } from '@/utils';

import { NestedObjectCardsItem } from './NestedObjectCardsItem';

/**
 * Props
 */
type Props = React.ComponentProps<typeof NestedObjectCardsItem>;

describe('NestedObjectCardsItem', () => {
  /**
   * Defaults
   */
  const replaceVariables = jest.fn();
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  const mapper = new NestedObjectCardMapper(
    createNestedObjectEditorConfig({
      type: NestedObjectType.CARDS,
      id: 'myId',
      body: 'myBody',
      title: 'myTitle',
      time: 'myTime',
      author: 'myAuthor',
    })
  );

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.nestedObjectCardsItem);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <NestedObjectCardsItem
        value={mapper.createNewPayload()}
        isEditEnabled={false}
        isDeleteEnabled={false}
        onEdit={onEdit}
        onDelete={onDelete}
        replaceVariables={replaceVariables}
        isEditing={false}
        isLoading={false}
        {...props}
      />
    );
  };

  beforeEach(() => {
    replaceVariables.mockImplementation((str: string) => str);
  });

  it('Should render item info', () => {
    const time = new Date().toISOString();

    render(
      getComponent({
        value: mapper.getPayload(
          mapper.createObject({
            title: 'My Title',
            author: 'Admin',
            time,
            body: 'My Description',
            id: 'myId',
          })
        ),
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('My Title');
    expect(selectors.root()).toHaveTextContent('Admin');
    expect(selectors.root()).toHaveTextContent('My Description');
  });

  it('Should render author if number', () => {
    render(
      getComponent({
        value: mapper.getPayload(
          mapper.createObject({
            author: 123,
          })
        ),
      })
    );

    expect(selectors.root()).toHaveTextContent('123');
  });

  it('Should allow to save edit', async () => {
    render(
      getComponent({
        value: mapper.getPayload(
          mapper.createObject({
            title: 'My Title',
            body: 'My Description',
            id: 'myId',
          })
        ),
        isEditEnabled: true,
        isEditing: undefined,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.buttonStartEdit()).toBeInTheDocument();
    fireEvent.click(selectors.buttonStartEdit());

    expect(selectors.fieldTitle()).toBeInTheDocument();
    fireEvent.change(selectors.fieldTitle(), { target: { value: '123' } });

    expect(selectors.fieldBody()).toBeInTheDocument();
    fireEvent.change(selectors.fieldBody(), { target: { value: 'some content' } });

    expect(selectors.buttonSaveEdit()).toBeInTheDocument();
    expect(selectors.buttonSaveEdit()).not.toBeDisabled();

    await act(async () => fireEvent.click(selectors.buttonSaveEdit()));

    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'myId',
        title: '123',
        body: 'some content',
      })
    );
  });

  it('Should allow to save edit again after error appeared', async () => {
    onEdit.mockRejectedValue({});

    render(
      getComponent({
        value: mapper.getPayload(
          mapper.createObject({
            title: 'My Title',
            body: 'My Description',
            id: 'myId',
          })
        ),
        isEditEnabled: true,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.buttonStartEdit()).toBeInTheDocument();
    fireEvent.click(selectors.buttonStartEdit());

    expect(selectors.buttonSaveEdit()).toBeInTheDocument();
    expect(selectors.buttonSaveEdit()).not.toBeDisabled();

    await act(async () => fireEvent.click(selectors.buttonSaveEdit()));

    expect(selectors.buttonSaveEdit()).toBeInTheDocument();
    expect(selectors.buttonCancelEdit()).not.toBeDisabled();
  });

  it('Should allow to cancel edit', () => {
    render(
      getComponent({
        isEditEnabled: true,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.buttonStartEdit()).toBeInTheDocument();
    fireEvent.click(selectors.buttonStartEdit());

    expect(selectors.fieldTitle()).toBeInTheDocument();
    expect(selectors.buttonCancelEdit()).toBeInTheDocument();
    expect(selectors.buttonCancelEdit()).not.toBeDisabled();

    fireEvent.click(selectors.buttonCancelEdit());

    expect(onEdit).toHaveBeenCalledWith(null);
    expect(selectors.fieldTitle(true)).not.toBeInTheDocument();
  });

  it('Should enable edit by default if passed', () => {
    render(
      getComponent({
        isEditEnabled: true,
        isEditing: true,
      })
    );

    expect(selectors.fieldTitle()).toBeInTheDocument();
    expect(selectors.buttonSaveEdit()).toBeInTheDocument();
  });

  it('Should allow to delete', () => {
    const mapper = new NestedObjectCardMapper(
      createNestedObjectEditorConfig({
        type: NestedObjectType.CARDS,
        id: 'myId',
        title: 'myTitle',
      })
    );

    render(
      getComponent({
        isDeleteEnabled: true,
        value: mapper.getPayload(
          mapper.createObject({
            id: 'myId',
          })
        ),
      })
    );

    expect(selectors.buttonStartDelete()).toBeInTheDocument();
    expect(selectors.buttonStartDelete()).not.toBeDisabled();

    fireEvent.click(selectors.buttonStartDelete());

    expect(selectors.modalConfirmDelete()).toBeInTheDocument();

    fireEvent.click(within(selectors.modalConfirmDelete()).getByTestId('confirm'));

    expect(onDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'myId',
      })
    );
  });

  it('Should not delete if not confirmed', () => {
    const mapper = new NestedObjectCardMapper(
      createNestedObjectEditorConfig({
        type: NestedObjectType.CARDS,
        id: 'myId',
      })
    );

    render(
      getComponent({
        isDeleteEnabled: true,
        value: mapper.getPayload(
          mapper.createObject({
            id: 'myId',
          })
        ),
      })
    );

    expect(selectors.buttonStartDelete()).toBeInTheDocument();
    expect(selectors.buttonStartDelete()).not.toBeDisabled();

    fireEvent.click(selectors.buttonStartDelete());

    expect(selectors.modalConfirmDelete()).toBeInTheDocument();

    fireEvent.click(within(selectors.modalConfirmDelete()).getByTestId('dismiss'));

    expect(onDelete).not.toHaveBeenCalled();
    expect(selectors.modalConfirmDelete(true)).not.toBeInTheDocument();
  });
});
