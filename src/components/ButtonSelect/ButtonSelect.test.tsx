import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { ButtonSelect } from './ButtonSelect';

/**
 * Props
 */
type Props = React.ComponentProps<typeof ButtonSelect>;

describe('ButtonSelect', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Page Size Options
   */
  const pageSizeOptions = [10, 20, 50, 100, 1000].map((value) => ({
    value,
    label: value.toString(),
  }));

  /**
   * In Test Ids
   */
  const inTestIds = {
    pageSize: createSelector('data-testid page-size'),
  };

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.buttonSelect, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <ButtonSelect onChange={onChange} options={pageSizeOptions} {...inTestIds.pageSize.apply()} {...props} />;
  };

  it('Should render component', () => {
    render(getComponent({ value: { value: 10 } }));

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should display value instead label', async () => {
    render(getComponent({ value: { value: 10 } }));

    expect(selectors.pageSize()).toBeInTheDocument();
    expect(selectors.pageSize()).toHaveTextContent('10');
  });

  it('Should open/close dropdown correct', async () => {
    render(getComponent({ value: { value: 10 } }));

    expect(selectors.pageSize()).toBeInTheDocument();
    expect(selectors.pageSize()).toHaveTextContent('10');

    expect(selectors.dropdown(true)).not.toBeInTheDocument();

    fireEvent.click(selectors.pageSize());
    expect(selectors.dropdown()).toBeInTheDocument();

    fireEvent.click(selectors.pageSize());
    expect(selectors.dropdown(true)).not.toBeInTheDocument();
  });

  it('Should handle onChange', async () => {
    const onChange = jest.fn();
    render(getComponent({ value: { value: 10 }, onChange }));

    expect(selectors.pageSize()).toBeInTheDocument();
    expect(selectors.pageSize()).toHaveTextContent('10');

    fireEvent.click(selectors.pageSize());

    expect(selectors.dropdown()).toBeInTheDocument();

    expect(selectors.option(false, 100)).toBeInTheDocument();

    fireEvent.click(selectors.option(false, 100));
    expect(onChange).toHaveBeenCalledWith({
      label: '100',
      value: 100,
    });
  });
});
