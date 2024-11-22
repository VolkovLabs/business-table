import { Icon } from '@grafana/ui';
import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { BooleanCellRenderer } from './BooleanCellRenderer';

type Props = React.ComponentProps<typeof BooleanCellRenderer>;

/**
 * Mock Icon
 */
const IconMock = ({ name, ...restProps }: any) => <span {...restProps}>{name}</span>;

/**
 * Mock @grafana/ui for Component to heck bgColor and color for cell
 */
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  Icon: jest.fn(),
}));

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

  beforeEach(() => {
    jest.mocked(Icon).mockImplementation(IconMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should render false value', () => {
    render(getComponent({ value: false }));
    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('circle');
    expect(selectors.root()).toHaveStyle({ color: 'inherit' });
  });

  it('Should render true value', () => {
    render(getComponent({ value: true, bgColor: '#ffffff' }));
    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('check-circle');
    expect(selectors.root()).toHaveStyle({ color: 'rgb(0, 0, 0)' });
  });

  it('Should render value with contrast color', () => {
    render(getComponent({ value: true, bgColor: '#E02F44' }));
    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('check-circle');
    expect(selectors.root()).toHaveStyle({ color: 'rgb(255, 255, 255)' });
  });
});
