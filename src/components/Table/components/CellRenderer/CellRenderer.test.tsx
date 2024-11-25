import { Column } from '@tanstack/react-table';
import { render } from '@testing-library/react';
import React from 'react';

import { CellType, ColumnMeta } from '@/types';
import { createColumnConfig } from '@/utils';

import { CellRenderer } from './CellRenderer';
import { BooleanCellRenderer, DefaultCellRenderer, LayoutCellRenderer, PreformattedCellRenderer } from './components';

type Props = React.ComponentProps<typeof CellRenderer>;

/**
 * Mock cells
 */
jest.mock('./components', () => ({
  DefaultCellRenderer: jest.fn(() => null),
  BooleanCellRenderer: jest.fn(() => null),
  LayoutCellRenderer: jest.fn(() => null),
  PreformattedCellRenderer: jest.fn(() => null),
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

  it('Should render default cell renderer by default', () => {
    render(getComponent({ column: createColumnWithMeta({ config: createColumnConfig({ type: 'abc' as any }) }) }));

    expect(DefaultCellRenderer).toHaveBeenCalled();
  });

  it('Should render boolean cell', () => {
    render(getComponent({ column: createColumnWithMeta({ config: createColumnConfig({ type: CellType.BOOLEAN }) }) }));

    expect(BooleanCellRenderer).toHaveBeenCalled();
  });

  it('Should render preformatted cell', () => {
    render(
      getComponent({ column: createColumnWithMeta({ config: createColumnConfig({ type: CellType.PREFORMATTED }) }) })
    );

    expect(PreformattedCellRenderer).toHaveBeenCalled();
  });
});
