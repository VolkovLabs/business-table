import { render, screen } from '@testing-library/react';
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
   * Panel Data
   */
  const data = {
    series: [],
  };

  /**
   * Get Tested Component
   */
  const getComponent = ({ options = { name: 'data' }, ...restProps }: Partial<Props>) => {
    return <TablePanel data={data} options={options} {...(restProps as any)} />;
  };

  it('Should find component', async () => {
    render(getComponent({}));
    expect(screen.getByTestId(TEST_IDS.panel.root)).toBeInTheDocument();
  });
});
