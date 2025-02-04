import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createColumnConfig, createField } from '@/utils';

import { GaugeCellRenderer } from './GaugeCellRenderer';

type Props = React.ComponentProps<typeof GaugeCellRenderer>;

describe('GaugeCellRenderer', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.gaugeCellRenderer);
  const selectors = getSelectors(screen);

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <GaugeCellRenderer renderValue={jest.fn()} {...(props as any)} />;
  };

  it('Should render error icon without display processor', () => {
    render(
      getComponent({
        config: createColumnConfig(),
        field: createField({ display: undefined }),
        value: 15,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.error()).toBeInTheDocument();
  });

  it('Should render gauge', () => {
    render(
      getComponent({
        config: createColumnConfig({}),
        field: createField({}),
        value: 123,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.gauge()).toBeInTheDocument();
    expect(selectors.gauge()).toHaveTextContent('123');

    expect(selectors.gauge()).not.toHaveStyle({ padding: '4px' });
  });

  it('Should render gauge in box if bgColor applied', () => {
    render(
      getComponent({
        config: createColumnConfig({}),
        field: createField({}),
        value: 123,
        bgColor: '#000000',
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.gauge()).toBeInTheDocument();
    expect(selectors.gauge()).toHaveTextContent('123');

    expect(selectors.gauge()).toHaveStyle({ padding: '4px' });
  });
});
