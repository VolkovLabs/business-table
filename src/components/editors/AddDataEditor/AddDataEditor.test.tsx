import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { createTableConfig, createTableOperationConfig } from '@/utils';

import { AddDataEditor, testIds } from './AddDataEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof AddDataEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  tableAddRowEditor: createSelector('data-testid table-add-row-editor'),
};

/**
 * Mock TableUpdateEditor
 */
jest.mock('./components/TableAddRowEditor', () => ({
  TableAddRowEditor: ({ onChange, value }: any) => (
    <input {...inTestIds.tableAddRowEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

describe('AddDataEditor', () => {
  /**
   * Defaults
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...testIds, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <AddDataEditor value={[]} onChange={onChange} context={{ data: [] }} item={{}} {...(props as any)} />;
  };

  it('Should allow to expand item', () => {
    render(
      getComponent({
        value: [createTableConfig({ addRow: createTableOperationConfig({ enabled: true }), name: 'item1' })],
      })
    );

    expect(selectors.itemHeader(false, 'item1')).toBeInTheDocument();
    expect(selectors.itemContent(true, 'item1')).not.toBeInTheDocument();

    fireEvent.click(selectors.itemHeader(false, 'item1'));

    expect(selectors.itemContent(false, 'item1')).toBeInTheDocument();
  });

  it('Should allow to change item', () => {
    const value = [
      createTableConfig({ addRow: createTableOperationConfig({ enabled: true }), name: 'item1' }),
      createTableConfig({ name: 'item2' }),
    ];

    render(getComponent({ value }));

    expect(selectors.itemHeader(false, 'item1')).toBeInTheDocument();
    fireEvent.click(selectors.itemHeader(false, 'item1'));

    expect(selectors.tableAddRowEditor()).toBeInTheDocument();
    fireEvent.change(selectors.tableAddRowEditor(), { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalledWith(value);
  });

  it('Should allow to enable item', () => {
    render(
      getComponent({
        value: [createTableConfig({ addRow: createTableOperationConfig({ enabled: false }), name: 'item1' })],
      })
    );

    expect(selectors.fieldItemEnabled(false, 'item1')).toBeInTheDocument();
    expect(selectors.fieldItemEnabled(false, 'item1')).not.toBeChecked();
    expect(selectors.itemContent(true, 'item1')).not.toBeInTheDocument();

    fireEvent.click(selectors.fieldItemEnabled(false, 'item1'));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        addRow: expect.objectContaining({
          enabled: true,
        }),
      }),
    ]);

    /**
     * Check if enabled item is expanded
     */
    expect(selectors.itemContent(false, 'item1')).toBeInTheDocument();
  });
});
