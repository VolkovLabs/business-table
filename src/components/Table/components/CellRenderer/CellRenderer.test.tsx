import { Column } from '@tanstack/react-table';
import { render } from '@testing-library/react';
import React from 'react';

import { CellType, ColumnMeta } from '@/types';
import { createColumnConfig } from '@/utils';

import { BooleanCellRenderer } from './BooleanCellRenderer';
import { CellRenderer } from './CellRenderer';
import { DefaultCellRenderer } from './DefaultCellRenderer';
import { ImageCellRenderer } from './ImageCellRenderer';
import { LayoutCellRenderer } from './LayoutCellRenderer';

type Props = React.ComponentProps<typeof CellRenderer>;

/**
 * Mock Default Cell Renderer
 */
jest.mock('./DefaultCellRenderer', () => ({
  DefaultCellRenderer: jest.fn(() => null),
}));

/**
 * Mock Boolean Cell Renderer
 */
jest.mock('./BooleanCellRenderer', () => ({
  BooleanCellRenderer: jest.fn(() => null),
}));

/**
 * Mock Layout Cell Renderer
 */
jest.mock('./LayoutCellRenderer', () => ({
  LayoutCellRenderer: jest.fn(() => null),
}));

/**
 * Mock Image Cell Renderer
 */
jest.mock('./ImageCellRenderer', () => ({
  ImageCellRenderer: jest.fn(() => null),
}));

describe('CellRenderer', () => {
  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <CellRenderer renderValue={jest.fn()} {...(props as any)} />;
  };

  /**
   * Create Column With Meta
   */
  const createColumnWithMeta = (meta: Partial<ColumnMeta>): Column<any> =>
    ({
      getSize: () => 100,
      columnDef: {
        meta,
      },
    }) as any;

  beforeEach(() => {
    jest.mocked(DefaultCellRenderer).mockClear();
    jest.mocked(LayoutCellRenderer).mockClear();
  });

  it('Should work if no meta', () => {
    render(
      getComponent({
        column: { columnDef: { meta: null } } as any,
      })
    );

    /**
     * Just to check if no errors so there is no assertion
     */
  });

  it('Should render default cell renderer if auto type', () => {
    render(
      getComponent({
        column: createColumnWithMeta({ config: createColumnConfig({ type: CellType.AUTO }) }),
      })
    );

    expect(DefaultCellRenderer).toHaveBeenCalled();
  });

  it('Should render default cell renderer if colored text type', () => {
    render(
      getComponent({ column: createColumnWithMeta({ config: createColumnConfig({ type: CellType.COLORED_TEXT }) }) })
    );

    expect(DefaultCellRenderer).toHaveBeenCalled();
  });

  it('Should render default cell renderer if no type', () => {
    render(getComponent({ column: createColumnWithMeta({ config: createColumnConfig({ type: '' as any }) }) }));

    expect(DefaultCellRenderer).toHaveBeenCalled();
  });

  it('Should render layout cell renderer if HTML selected', () => {
    render(
      getComponent({
        column: createColumnWithMeta({ config: createColumnConfig({ type: CellType.RICH_TEXT as any }) }),
      })
    );

    expect(LayoutCellRenderer).toHaveBeenCalled();
  });

  it('Should render image cell', () => {
    render(
      getComponent({
        column: createColumnWithMeta({ config: createColumnConfig({ type: CellType.IMAGE as any }) }),
      })
    );

    expect(ImageCellRenderer).toHaveBeenCalled();
  });

  it('Should render default cell renderer by default', () => {
    render(getComponent({ column: createColumnWithMeta({ config: createColumnConfig({ type: 'abc' as any }) }) }));

    expect(DefaultCellRenderer).toHaveBeenCalled();
  });

  it('Should render boolean cell', () => {
    render(getComponent({ column: createColumnWithMeta({ config: createColumnConfig({ type: CellType.BOOLEAN }) }) }));

    expect(BooleanCellRenderer).toHaveBeenCalled();
  });
});
