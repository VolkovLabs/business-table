import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createTableConfig } from '@/utils';

import { EditableDataEditor } from './EditableDataEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof EditableDataEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  tableUpdateEditor: createSelector('data-testid table-update-editor'),
};

/**
 * Mock TableUpdateEditor
 */
jest.mock('./components/TableUpdateEditor', () => ({
  TableUpdateEditor: ({ onChange, value }: any) => (
    <input {...inTestIds.tableUpdateEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

describe('EditableDataEditor', () => {
  /**
   * Defaults
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.editableDataEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <EditableDataEditor value={[]} onChange={onChange} context={{ data: [] }} item={{}} {...(props as any)} />;
  };

  it('Should allow to expand item', () => {
    render(getComponent({ value: [createTableConfig({ name: 'item1' })] }));

    expect(selectors.itemHeader(false, 'item1')).toBeInTheDocument();
    expect(selectors.itemContent(true, 'item1')).not.toBeInTheDocument();

    fireEvent.click(selectors.itemHeader(false, 'item1'));

    expect(selectors.itemContent(false, 'item1')).toBeInTheDocument();
  });

  it('Should allow to change item', () => {
    const value = [createTableConfig({ name: 'item1' }), createTableConfig({ name: 'item2' })];

    render(getComponent({ value }));

    expect(selectors.itemHeader(false, 'item1')).toBeInTheDocument();
    fireEvent.click(selectors.itemHeader(false, 'item1'));

    expect(selectors.tableUpdateEditor()).toBeInTheDocument();
    fireEvent.change(selectors.tableUpdateEditor(), { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalledWith(value);
  });
});
