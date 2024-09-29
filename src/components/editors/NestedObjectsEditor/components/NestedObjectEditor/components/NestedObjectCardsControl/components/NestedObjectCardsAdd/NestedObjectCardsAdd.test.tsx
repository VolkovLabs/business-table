import { act, fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { NestedObjectType } from '@/types';
import { createNestedObjectEditorConfig, NestedObjectCardMapper } from '@/utils';

import { NestedObjectCardsAdd } from './NestedObjectCardsAdd';

/**
 * Props
 */
type Props = React.Component<typeof NestedObjectCardsAdd>;

/**
 * In Test Ids
 */
const inTestIds = {
  form: createSelector('data-testid form'),
  buttonSaveEdit: createSelector('data-testid button-save-edit'),
  buttonCancelEdit: createSelector('data-testid button-cancel-edit'),
};

/**
 * Mock NestedObjectCardsItem
 */
jest.mock('../NestedObjectCardsItem', () => ({
  NestedObjectCardsItem: ({ value, onEdit, isLoading }: any) => (
    <div {...inTestIds.form.apply()}>
      <input {...inTestIds.buttonCancelEdit.apply()} onClick={() => onEdit(null)} disabled={isLoading} />
      <input {...inTestIds.buttonSaveEdit.apply()} onClick={() => onEdit(value)} disabled={isLoading} />
    </div>
  ),
}));

describe('NestedObjectCardsAdd', () => {
  /**
   * Defaults
   */
  const replaceVariables = jest.fn();
  const onAdd = jest.fn();
  const mapper = new NestedObjectCardMapper(
    createNestedObjectEditorConfig({
      type: NestedObjectType.CARDS,
      id: 'myId',
    })
  );

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.nestedObjectCardsAdd, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <NestedObjectCardsAdd mapper={mapper} onAdd={onAdd} replaceVariables={replaceVariables} {...props} />;
  };

  beforeEach(() => {
    replaceVariables.mockImplementation((str: string) => str);
  });

  it('Should allow to add', async () => {
    render(getComponent({}));

    expect(selectors.buttonAdd()).toBeInTheDocument();
    expect(selectors.buttonAdd()).not.toBeDisabled();

    fireEvent.click(selectors.buttonAdd());

    expect(selectors.form());
    expect(selectors.buttonSaveEdit()).toBeInTheDocument();

    await act(async () => fireEvent.click(selectors.buttonSaveEdit()));

    expect(onAdd).toHaveBeenCalledWith({});
  });

  it('Should allow to add after error appeared', async () => {
    onAdd.mockRejectedValue({});

    render(getComponent({}));

    expect(selectors.buttonAdd()).toBeInTheDocument();
    expect(selectors.buttonAdd()).not.toBeDisabled();

    fireEvent.click(selectors.buttonAdd());

    expect(selectors.form());
    expect(selectors.buttonSaveEdit()).toBeInTheDocument();

    await act(async () => fireEvent.click(selectors.buttonSaveEdit()));

    expect(selectors.buttonSaveEdit()).toBeInTheDocument();
    expect(selectors.buttonSaveEdit()).not.toBeDisabled();
  });

  it('Should not to add if canceled', async () => {
    render(getComponent({}));

    expect(selectors.buttonAdd()).toBeInTheDocument();
    expect(selectors.buttonAdd()).not.toBeDisabled();

    fireEvent.click(selectors.buttonAdd());

    expect(selectors.form());
    expect(selectors.buttonCancelEdit()).toBeInTheDocument();

    await act(async () => fireEvent.click(selectors.buttonCancelEdit()));

    expect(onAdd).not.toHaveBeenCalledWith({});
  });
});
