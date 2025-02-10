import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createColumnAppearanceConfig, createColumnConfig, createField } from '@/utils';

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

    /**
     * Apply width from config value
     */
    expect(selectors.gauge()).toHaveStyle({ width: '100px' });
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

  it('Should apply cell width if column width auto', () => {
    render(
      getComponent({
        config: createColumnConfig({
          appearance: createColumnAppearanceConfig({
            width: {
              auto: true,
              value: 15,
            },
          }),
        }),
        field: createField({}),
        value: 123,
        bgColor: '#000000',
      })
    );
    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.gauge()).toBeInTheDocument();

    /**
     * Apply width from parent div
     * in test elementRef.current.offsetWidth equal 0px
     * check useEffect condition only
     */
    expect(selectors.gauge()).toHaveStyle({ width: '0px' });
  });
});
