import { Column } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { CellAggregation, ColumnMeta } from '@/types';
import { createColumnConfig, createField } from '@/utils';

import { AggregatedCellRenderer } from './AggregatedCellRenderer';

type Props = React.ComponentProps<typeof AggregatedCellRenderer>;

/**
 * Aggregated Cell renderer
 */
describe('AggregatedCellRenderer', () => {
  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <AggregatedCellRenderer renderValue={jest.fn()} {...(props as any)} />;
  };

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.aggregatedCellRenderer);
  const selectors = getSelectors(screen);

  /**
   * Create Column With Meta
   */
  const createColumnWithMeta = (meta: Partial<ColumnMeta>): Column<any> =>
    ({
      columnDef: {
        meta,
      },
    }) as any;

  it('Should work if no meta', () => {
    render(
      getComponent({
        column: { columnDef: { meta: null } } as any,
      })
    );

    /**
     * Just to check if no errors so there is no assertion
     */
    expect(selectors.root(true)).not.toBeInTheDocument();
  });

  it('Should render value and don`t use displayProcessor', () => {
    const renderValue: any = jest.fn(() => '123test');
    render(
      getComponent({
        column: createColumnWithMeta({
          config: createColumnConfig({ aggregation: CellAggregation.COUNT }),
          field: createField({ config: { unit: 'percent' } }),
        }),
        renderValue: renderValue,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('123test');
  });

  it('Should render value for min aggregation type', async () => {
    const renderValue: any = jest.fn(() => 123);

    render(
      getComponent({
        column: createColumnWithMeta({
          config: createColumnConfig({ aggregation: CellAggregation.MIN }),
          field: createField({ config: { unit: 'percent' } }),
        }),
        renderValue: renderValue,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('123%');
  });
});
