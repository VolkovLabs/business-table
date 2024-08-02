import React from 'react';
import { render } from '@testing-library/react';

import { CellRenderer } from './CellRenderer';
import { DefaultCellRenderer } from './DefaultCellRenderer';
import { CellType } from '../../types';
import { createColumnConfig } from '../../utils';

type Props = React.ComponentProps<typeof CellRenderer>;

/**
 * Mock Default Cell Renderer
 */
jest.mock('./DefaultCellRenderer', () => ({
  DefaultCellRenderer: jest.fn(() => null),
}));

describe('CellRenderer', () => {
  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <CellRenderer renderValue={jest.fn()} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(DefaultCellRenderer).mockClear();
  });

  it('Should render default cell renderer if auto type', () => {
    render(getComponent({ config: createColumnConfig({ type: CellType.AUTO }) }));

    expect(DefaultCellRenderer).toHaveBeenCalled();
  });

  it('Should render default cell renderer if colored text type', () => {
    render(getComponent({ config: createColumnConfig({ type: CellType.COLORED_TEXT }) }));

    expect(DefaultCellRenderer).toHaveBeenCalled();
  });

  it('Should render default cell renderer if no type', () => {
    render(getComponent({ config: createColumnConfig({ type: '' as any }) }));

    expect(DefaultCellRenderer).toHaveBeenCalled();
  });

  it('Should render default cell renderer by default', () => {
    render(getComponent({ config: createColumnConfig({ type: 'abc' as any }) }));

    expect(DefaultCellRenderer).toHaveBeenCalled();
  });
});
