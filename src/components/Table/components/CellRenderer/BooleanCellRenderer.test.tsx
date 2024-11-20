import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { BooleanCellRenderer } from './BooleanCellRenderer';

type Props = React.ComponentProps<typeof BooleanCellRenderer>;

/**
 * Mock @grafana/ui for Component to heck bgColor and color for cell
 */
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  Icon: (props: any) => {
    return <span {...props}>{props.name}</span>;
  },
}));

describe('BooleanCellRenderer', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.booleanCellRenderer, ['icon']);
  const selectors = getSelectors(screen);

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <BooleanCellRenderer value={jest.fn()} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render false value', () => {
    render(getComponent({ value: false }));
    expect(selectors.icon(false, 'circle')).toBeInTheDocument();
  });

  it('Should render true value', () => {
    render(getComponent({ value: true, bgColor: '#000000' }));
    expect(selectors.icon(false, 'check-circle')).toBeInTheDocument();
  });

  it('Should render value with contrast color', () => {
    render(getComponent({ value: true, bgColor: '#E02F44' }));
    expect(selectors.icon(false, 'check-circle')).toBeInTheDocument();
    expect(selectors.icon(false, 'check-circle')).toHaveStyle({ color: 'rgb(255, 255, 255)' });
  });
});
