import { act, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { TablePanel } from './TablePanel';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TablePanel>;

/**
 * Panel
 */
describe('TablePanel', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.panel);
  const selectors = getSelectors(screen);

  /**
   * Panel Data
   */
  const data = {
    series: [],
  };

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TablePanel data={data} options={{}} {...(props as any)} />;
  };

  it('Should find component', async () => {
    await act(async () => render(getComponent({})));
    expect(selectors.root()).toBeInTheDocument();
  });
});
