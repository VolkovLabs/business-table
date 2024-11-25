import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createColumnConfig, createField } from '@/utils';

import { PreformattedCellRenderer } from './PreformattedCellRenderer';

type Props = React.ComponentProps<typeof PreformattedCellRenderer>;

describe('PreformattedCellRenderer', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.preformattedCellRenderer);
  const selectors = getSelectors(screen);

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <PreformattedCellRenderer renderValue={jest.fn()} {...(props as any)} />;
  };

  it('Should render value', () => {
    render(
      getComponent({
        config: createColumnConfig({ preformattedStyle: false }),
        field: createField({ display: undefined }),
        value: 123,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('123');
    expect(selectors.root()).toHaveStyle('color: inherit');
    expect(selectors.root()).toHaveStyle('border: none');
  });

  it('Should format value by display', () => {
    render(getComponent({ config: createColumnConfig(), field: createField({ config: { unit: 'abc' } }), value: 123 }));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('123 abc');
  });

  it('Should apply styles depend on bgColor', () => {
    render(
      getComponent({
        config: createColumnConfig({ preformattedStyle: true }),
        field: createField({ display: undefined }),
        value: 123,
        bgColor: '#000000',
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('123');
    expect(selectors.root()).toHaveStyle('color: rgb(255, 255, 255)');
    expect(selectors.root()).toHaveStyle('background: inherit');
  });
});
