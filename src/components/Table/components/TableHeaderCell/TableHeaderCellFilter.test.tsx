import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { FilterPopup } from '@/components/Table/components';
import { TEST_IDS } from '@/constants';

import { TableHeaderCellFilter } from './TableHeaderCellFilter';

type Props = React.ComponentProps<typeof TableHeaderCellFilter>;

const inTestIds = {
  filterPopup: createSelector('data-testid filter-popup'),
};

const FilterPopupMock = ({ onClose }: any) => {
  return <div {...inTestIds.filterPopup.apply()} onClick={onClose} />;
};
/**
 * Mock FilterPopup
 */
jest.mock('../FilterPopup', () => ({
  FilterPopup: jest.fn(),
}));

describe('TableHeaderCellFilter', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.tableHeaderCellFilter,
    ...inTestIds,
  });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TableHeaderCellFilter {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(FilterPopup).mockImplementation(FilterPopupMock);
  });

  it('Should allow to open filter', () => {
    render(
      getComponent({
        header: {
          column: {
            getIsFiltered: () => false,
          },
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.filterPopup(true)).not.toBeInTheDocument();

    /**
     * Open Filter
     */
    fireEvent.click(selectors.root());

    expect(selectors.filterPopup()).toBeInTheDocument();

    /**
     * Close Filter
     */
    fireEvent.click(selectors.filterPopup());

    expect(selectors.filterPopup(true)).not.toBeInTheDocument();
  });

  it('Should render active filter state', () => {
    render(
      getComponent({
        header: {
          column: {
            getIsFiltered: () => true,
          },
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.filterPopup(true)).not.toBeInTheDocument();
  });
});
