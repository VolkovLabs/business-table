import { dateTime } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';
import { getFilterWithNewType } from '@/utils';

import { FilterSection } from '../FilterSection';
import { FilterPopup } from './FilterPopup';

type Props = React.ComponentProps<typeof FilterPopup>;

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

describe('FilterPopup', () => {
  /**
   * Props
   */
  const onClose = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.filterPopup,
    ...inTestIds,
  });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <FilterPopup onClose={onClose} {...(props as any)} />;
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

    expect(setFilterValue).toHaveBeenCalledWith(undefined);
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

    fireEvent.click(selectors.buttonSave());

    expect(locationService.partial).toHaveBeenCalledWith(
      {
        'var-var1': 'abc',
      },
      true
    );
  });

  it('Should update user preferences on save if specified', () => {
    const setFilterValue = jest.fn();
    const updatePreferencesWithFilters = jest.fn();
    render(
      getComponent({
        saveUserPreference: true,
        updatePreferencesWithFilters,
        header: {
          id: 'column',
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

    fireEvent.click(selectors.buttonSave());

    expect(updatePreferencesWithFilters).toHaveBeenCalled();
    expect(updatePreferencesWithFilters).toHaveBeenCalledWith('column', {
      caseSensitive: false,
      type: 'search',
      value: 'abc',
    });
    expect(locationService.partial).toHaveBeenCalledWith(
      {
        'var-var1': 'abc',
      },
      true
    );
  });

  it('Should reset variable on filter clear', () => {
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

    expect(selectors.buttonClear()).toBeInTheDocument();

    fireEvent.click(selectors.buttonClear());
    fireEvent.click(selectors.buttonSave());

    expect(locationService.partial).toHaveBeenCalledWith(
      {
        'var-var1': null,
      },
      true
    );
  });

  describe('Faceted', () => {
    it('Should allow to use client filter', async () => {
      const setFilterValue = jest.fn();

      render(
        getComponent({
          header: {
            column: {
              setFilterValue,
              getFilterValue: () => undefined,
              columnDef: {
                meta: {
                  filterMode: ColumnFilterMode.CLIENT,
                  availableFilterTypes: [ColumnFilterType.FACETED],
                },
              },
            },
          } as any,
        })
      );

      expect(selectors.root()).toBeInTheDocument();

      expect(selectors.filterSection()).toBeInTheDocument();

      const filterValue = createFilterValue({
        type: ColumnFilterType.FACETED,
        value: ['a', 'b'],
      });

      triggerFilterChange(selectors.filterSection(), filterValue);

      fireEvent.click(selectors.buttonSave());

      expect(setFilterValue).toHaveBeenCalledWith(filterValue);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Number', () => {
    it('Should allow to use client filter', async () => {
      const setFilterValue = jest.fn();

      render(
        getComponent({
          header: {
            column: {
              setFilterValue,
              getFilterValue: () => undefined,
              columnDef: {
                meta: {
                  filterMode: ColumnFilterMode.CLIENT,
                  availableFilterTypes: [ColumnFilterType.NUMBER],
                },
              },
            },
          } as any,
        })
      );

      expect(selectors.root()).toBeInTheDocument();

      expect(selectors.filterSection()).toBeInTheDocument();

      const filterValue = createFilterValue({
        type: ColumnFilterType.NUMBER,
        value: [0, 10],
      });

      triggerFilterChange(selectors.filterSection(), filterValue);

      fireEvent.click(selectors.buttonSave());

      expect(setFilterValue).toHaveBeenCalledWith(filterValue);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('TimeStamp', () => {
    it('Should allow to use client filter', async () => {
      const setFilterValue = jest.fn();

      render(
        getComponent({
          header: {
            column: {
              setFilterValue,
              getFilterValue: () => undefined,
              columnDef: {
                meta: {
                  filterMode: ColumnFilterMode.CLIENT,
                  availableFilterTypes: [ColumnFilterType.TIMESTAMP],
                },
              },
            },
          } as any,
        })
      );

      expect(selectors.root()).toBeInTheDocument();

      expect(selectors.filterSection()).toBeInTheDocument();

      const filterValue = createFilterValue({
        type: ColumnFilterType.TIMESTAMP,
        value: {
          from: dateTime(),
          to: dateTime(),
          raw: {
            from: dateTime(),
            to: dateTime(),
          },
        },
      });

      triggerFilterChange(selectors.filterSection(), filterValue);

      fireEvent.click(selectors.buttonSave());

      expect(setFilterValue).toHaveBeenCalledWith(filterValue);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
