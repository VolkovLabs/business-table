import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
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
  const InTestIds = {
    pageSize: 'data-testid page-size',
  };

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.buttonSelect, ...InTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <ButtonSelect onChange={onChange} options={pageSizeOptions} data-testid={InTestIds.pageSize} {...props} />;
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

  it('Should open/close dropdown correctlys', async () => {
    render(getComponent({ value: { value: 10 } }));

    expect(selectors.pageSize()).toBeInTheDocument();

    expect(selectors.pageSize()).toHaveTextContent('10');

    expect(selectors.dropDown(true)).not.toBeInTheDocument();

    fireEvent.click(selectors.pageSize());

    expect(selectors.dropDown(true)).toBeInTheDocument();

    fireEvent.click(selectors.pageSize());

    expect(selectors.dropDown(true)).not.toBeInTheDocument();
  });
});
