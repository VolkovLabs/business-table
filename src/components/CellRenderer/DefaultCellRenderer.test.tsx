import { createTheme, ThresholdsMode } from '@grafana/data';
import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';
import { TEST_IDS } from '../../constants';
import { CellType } from '../../types';
import { createField, createColumnConfig } from '../../utils';

import { DefaultCellRenderer } from './DefaultCellRenderer';

type Props = React.ComponentProps<typeof DefaultCellRenderer>;

describe('DefaultCellRenderer', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.defaultCellRenderer);
  const selectors = getSelectors(screen);

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <DefaultCellRenderer renderValue={jest.fn()} {...(props as any)} />;
  };

  it('Should render value', () => {
    render(getComponent({ config: createColumnConfig(), field: createField({ display: undefined }), value: 123 }));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('123');
    expect(selectors.root()).toHaveStyle('color: inherit');
  });

  it('Should format value by display', () => {
    render(getComponent({ config: createColumnConfig(), field: createField({ config: { unit: 'abc' } }), value: 123 }));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('123 abc');
  });

  describe('Colored text', () => {
    const config = createColumnConfig({
      type: CellType.COLORED_TEXT,
    });
    const field = createField({
      config: {
        thresholds: {
          mode: ThresholdsMode.Absolute,
          steps: [
            {
              value: 0,
              color: 'green',
            },
            {
              value: 20,
              color: 'orange',
            },
            {
              value: 50,
              color: 'red',
            },
          ],
        },
      },
    });
    const theme = createTheme();

    it('Should show green threshold', () => {
      render(
        getComponent({
          config,
          field,
          value: 5,
        })
      );

      expect(selectors.root()).toHaveTextContent('5');
      expect(selectors.root()).toHaveStyle(`color: ${theme.visualization.getColorByName('green')}`);
    });

    it('Should show orange threshold', () => {
      render(
        getComponent({
          config,
          field,
          value: 25,
        })
      );

      expect(selectors.root()).toHaveTextContent('25');
      expect(selectors.root()).toHaveStyle(`color: ${theme.visualization.getColorByName('orange')}`);
    });

    it('Should show red threshold', () => {
      render(
        getComponent({
          config,
          field,
          value: 75,
        })
      );

      expect(selectors.root()).toHaveTextContent('75');
      expect(selectors.root()).toHaveStyle(`color: ${theme.visualization.getColorByName('red')}`);
    });
  });
});
