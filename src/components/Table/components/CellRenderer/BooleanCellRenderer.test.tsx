import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { BooleanCellRenderer } from './BooleanCellRenderer';

type Props = React.ComponentProps<typeof BooleanCellRenderer>;

describe('BooleanCellRenderer', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.booleanCellRenderer);
  const selectors = getSelectors(screen);

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <BooleanCellRenderer value={jest.fn()} {...(props as any)} />;
  };

  it('Should render value', () => {
    render(getComponent({ value: false }));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toBeDisabled();
  });
});
