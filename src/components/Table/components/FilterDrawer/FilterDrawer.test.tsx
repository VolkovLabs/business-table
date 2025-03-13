import { locationService } from '@grafana/runtime';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';
import { getFilterWithNewType } from '@/utils';

import { FilterSection } from '../FilterSection';
import { FilterDrawer } from './FilterDrawer';

type Props = React.ComponentProps<typeof FilterDrawer>;

const inTestIds = {
  filterSection: createSelector('data-testid filter-section'),
};

const createFilterMock =
  (testId: string) =>
  // eslint-disable-next-line react/display-name
  ({ onChange }: any) => {
    return (
      <button
        value=""
        data-testid={testId}
        onDrop={(event: any) => {
          onChange(event.dataTransfer);
        }}
      />
    );
  };

const FilterSectionMock = createFilterMock(inTestIds.filterSection.selector());

/**
 * Mock filters
 */
jest.mock('../FilterSection', () => ({
  FilterSection: jest.fn(),
}));

describe('FilterDrawer', () => {
  /**
   * Props
   */
  const updatePreferencesWithFilters = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.filterDrawer,
    ...inTestIds,
  });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <FilterDrawer updatePreferencesWithFilters={updatePreferencesWithFilters} {...(props as any)} />;
  };

  /**
   * Create Filter Value
   * @param params
   */
  const createFilterValue = (params: Partial<ColumnFilterValue>): ColumnFilterValue =>
    ({
      ...getFilterWithNewType(params?.type || 'none'),
      ...params,
    }) as never;

  /**
   * Trigger Filter Change
   */
  const triggerFilterChange = (element: HTMLElement, filterValue: ColumnFilterValue): void => {
    fireEvent.drop(element, {
      dataTransfer: filterValue,
    });
  };

  beforeEach(() => {
    jest.mocked(FilterSection).mockImplementation(FilterSectionMock);
  });

  it('Should render', () => {
    render(
      getComponent({
        header: {
          column: {
            getFilterValue: () => undefined,
            columnDef: {
              meta: {},
            },
          },
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should allow to reset filter', () => {
    const setFilterValue = jest.fn();

    render(
      getComponent({
        header: {
          column: {
            setFilterValue,
            getFilterValue: () =>
              createFilterValue({
                type: ColumnFilterType.SEARCH,
                value: 'abc',
              }),
            columnDef: {
              meta: {
                filterMode: ColumnFilterMode.CLIENT,
                availableFilterTypes: [ColumnFilterType.SEARCH, ColumnFilterType.FACETED],
              },
            },
          },
        } as any,
      })
    );

    expect(selectors.buttonClear()).toBeInTheDocument();

    fireEvent.click(selectors.buttonClear());

    expect(updatePreferencesWithFilters).toHaveBeenCalled();
  });

  it('Should update variable on filter change', () => {
    const setFilterValue = jest.fn();

    render(
      getComponent({
        header: {
          column: {
            setFilterValue,
            getFilterValue: () => undefined,
            columnDef: {
              meta: {
                filterMode: ColumnFilterMode.QUERY,
                availableFilterTypes: [ColumnFilterType.SEARCH],
                filterVariableName: 'var1',
              },
            },
          },
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.filterSection()).toBeInTheDocument();

    triggerFilterChange(
      selectors.filterSection(),
      createFilterValue({
        type: ColumnFilterType.SEARCH,
        value: 'abc',
      })
    );

    expect(locationService.partial).toHaveBeenCalledWith(
      {
        'var-var1': 'abc',
      },
      true
    );

    expect(updatePreferencesWithFilters).toHaveBeenCalled();
  });
});
