import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { PaginationMode } from '@/types';
import { createTableConfig, createTablePaginationConfig } from '@/utils';

import { PaginationsEditor } from './PaginationsEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof PaginationsEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  paginationEditor: createSelector('data-testid pagination-editor'),
};

/**
 * Mock PaginationEditor
 */
jest.mock('./components/PaginationEditor', () => ({
  PaginationEditor: ({ onChange, value }: any) => (
    <input {...inTestIds.paginationEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

describe('Paginations Editor', () => {
  /**
   * Defaults
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.paginationsEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <PaginationsEditor value={[]} onChange={onChange} context={{ data: [] }} item={{}} {...(props as any)} />;
  };

  it('Should not allow to expand item if pagination disabled', () => {
    render(getComponent({ value: [createTableConfig({ name: 'item1' })] }));

    expect(selectors.itemHeader(false, 'item1')).toBeInTheDocument();
    expect(selectors.itemContent(true, 'item1')).not.toBeInTheDocument();

    fireEvent.click(selectors.itemHeader(false, 'item1'));

    expect(selectors.itemContent(true, 'item1')).not.toBeInTheDocument();
  });

  it('Should  allow to expand item if pagination enable', () => {
    render(
      getComponent({
        value: [
          createTableConfig({
            name: 'item1',
            pagination: createTablePaginationConfig({
              enabled: true,
            }),
          }),
        ],
      })
    );

    expect(selectors.itemHeader(false, 'item1')).toBeInTheDocument();
    expect(selectors.itemContent(true, 'item1')).not.toBeInTheDocument();

    fireEvent.click(selectors.itemHeader(false, 'item1'));

    expect(selectors.itemContent(false, 'item1')).toBeInTheDocument();
  });

  it('Should change pagination enable state', () => {
    render(getComponent({ value: [createTableConfig({ name: 'item1' })] }));

    expect(selectors.itemHeader(false, 'item1')).toBeInTheDocument();
    expect(selectors.itemContent(true, 'item1')).not.toBeInTheDocument();
    expect(selectors.fieldPaginationEnabled(false, 'item1')).toBeInTheDocument();

    fireEvent.click(selectors.itemHeader(false, 'item1'));

    expect(selectors.itemContent(true, 'item1')).not.toBeInTheDocument();

    fireEvent.click(selectors.fieldPaginationEnabled(false, 'item1'));

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          pagination: expect.objectContaining({
            mode: PaginationMode.CLIENT,
            enabled: true,
          }),
        }),
      ])
    );

    expect(selectors.itemContent(false, 'item1')).toBeInTheDocument();
  });

  it('Should allow to change item', () => {
    const value = [
      createTableConfig({
        name: 'item1',
        pagination: createTablePaginationConfig({
          enabled: true,
        }),
      }),
      createTableConfig({ name: 'item2' }),
    ];

    render(getComponent({ value }));

    expect(selectors.itemHeader(false, 'item1')).toBeInTheDocument();
    fireEvent.click(selectors.itemHeader(false, 'item1'));

    expect(selectors.paginationEditor()).toBeInTheDocument();
    fireEvent.change(selectors.paginationEditor(), { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalledWith(value);
  });
});
