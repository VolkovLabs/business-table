import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { DateEditor } from './DateEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof DateEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  root: createSelector('data-testid date-editor'),
};

describe('DateEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.dateEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <DateEditor onChange={onChange} label="min" data-testid={inTestIds.root.selector()} {...(props as any)} />;
  };

  it('Should allow to set date if empty', () => {
    render(getComponent({ value: undefined }));

    expect(selectors.buttonSetDate()).toBeInTheDocument();

    fireEvent.click(selectors.buttonSetDate());

    expect(onChange).toHaveBeenCalledWith(expect.any(String));
  });

  it('Should allow to change date', () => {
    render(getComponent({ value: new Date().toISOString() }));

    expect(selectors.field()).toBeInTheDocument();

    const newDateString = new Date().toISOString();
    fireEvent.change(selectors.field(), { target: { value: newDateString } });

    expect(onChange).toHaveBeenCalledWith(newDateString);
  });

  it('Should allow to remove date', () => {
    render(getComponent({ value: new Date().toISOString() }));

    expect(selectors.buttonRemoveDate()).toBeInTheDocument();

    fireEvent.click(selectors.buttonRemoveDate());

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
