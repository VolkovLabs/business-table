import { dateTime } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';
import { getFilterWithNewType } from '@/utils';

import { FilterFacetedList, FilterNumber, FilterSearch, FilterTime } from './components';
import { FilterPopup } from './FilterPopup';

type Props = React.ComponentProps<typeof FilterPopup>;

const inTestIds = {
  filterTime: createSelector('data-testid filter-time'),
  filterNumber: createSelector('data-testid filter-number'),
  filterFaceted: createSelector('data-testid filter-faceted'),
  filterSearch: createSelector('data-testid filter-search'),
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

const FilterTimeMock = createFilterMock(inTestIds.filterTime.selector());
const FilterFacetedMock = createFilterMock(inTestIds.filterFaceted.selector());
const FilterSearchMock = createFilterMock(inTestIds.filterSearch.selector());
const FilterNumberMock = createFilterMock(inTestIds.filterNumber.selector());

/**
 * Mock filters
 */
jest.mock('./components', () => ({
  FilterTime: jest.fn(),
  FilterSearch: jest.fn(),
  FilterFacetedList: jest.fn(),
  FilterNumber: jest.fn(),
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
    jest.mocked(FilterNumber).mockImplementation(FilterNumberMock);
    jest.mocked(FilterSearch).mockImplementation(FilterSearchMock);
    jest.mocked(FilterFacetedList).mockImplementation(FilterFacetedMock);
    jest.mocked(FilterTime).mockImplementation(FilterTimeMock);
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

  it('Should allow to change filter type if several', () => {
    render(
      getComponent({
        header: {
          column: {
            getFilterValue: () => undefined,
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

    expect(selectors.filterSearch()).toBeInTheDocument();
    expect(selectors.filterFaceted(true)).not.toBeInTheDocument();

    fireEvent.click(selectors.typeOption(false, ColumnFilterType.FACETED));

    expect(selectors.filterSearch(true)).not.toBeInTheDocument();
    expect(selectors.filterFaceted()).toBeInTheDocument();
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

    expect(selectors.filterSearch()).toBeInTheDocument();

    triggerFilterChange(
      selectors.filterSearch(),
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

  describe('Search', () => {
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
                  availableFilterTypes: [ColumnFilterType.SEARCH],
                },
              },
            },
          } as any,
        })
      );

      expect(selectors.root()).toBeInTheDocument();

      expect(selectors.filterSearch()).toBeInTheDocument();

      const filterValue = createFilterValue({
        type: ColumnFilterType.SEARCH,
        value: 'abc',
      });

      triggerFilterChange(selectors.filterSearch(), filterValue);

      fireEvent.click(selectors.buttonSave());

      expect(setFilterValue).toHaveBeenCalledWith(filterValue);
      expect(onClose).toHaveBeenCalled();
    });

    it('Should clear client filter if empty', async () => {
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
                  availableFilterTypes: [ColumnFilterType.SEARCH],
                },
              },
            },
          } as any,
        })
      );

      expect(selectors.root()).toBeInTheDocument();

      expect(selectors.filterSearch()).toBeInTheDocument();

      const filterValue = createFilterValue({
        type: ColumnFilterType.SEARCH,
        value: '',
      });

      triggerFilterChange(selectors.filterSearch(), filterValue);

      fireEvent.click(selectors.buttonSave());

      expect(setFilterValue).toHaveBeenCalledWith(undefined);
      expect(onClose).toHaveBeenCalled();
    });
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

      expect(selectors.filterFaceted()).toBeInTheDocument();

      const filterValue = createFilterValue({
        type: ColumnFilterType.FACETED,
        value: ['a', 'b'],
      });

      triggerFilterChange(selectors.filterFaceted(), filterValue);

      fireEvent.click(selectors.buttonSave());

      expect(setFilterValue).toHaveBeenCalledWith(filterValue);
      expect(onClose).toHaveBeenCalled();
    });

    it('Should clear client filter if empty', async () => {
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

      expect(selectors.filterFaceted()).toBeInTheDocument();

      const filterValue = createFilterValue({
        type: ColumnFilterType.FACETED,
        value: [],
      });

      triggerFilterChange(selectors.filterFaceted(), filterValue);

      fireEvent.click(selectors.buttonSave());

      expect(setFilterValue).toHaveBeenCalledWith(undefined);
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

      expect(selectors.filterNumber()).toBeInTheDocument();

      const filterValue = createFilterValue({
        type: ColumnFilterType.NUMBER,
        value: [0, 10],
      });

      triggerFilterChange(selectors.filterNumber(), filterValue);

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

      expect(selectors.filterTime()).toBeInTheDocument();

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

      triggerFilterChange(selectors.filterTime(), filterValue);

      fireEvent.click(selectors.buttonSave());

      expect(setFilterValue).toHaveBeenCalledWith(filterValue);
      expect(onClose).toHaveBeenCalled();
    });

    it('Should clear client filter if empty', async () => {
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

      expect(selectors.filterTime()).toBeInTheDocument();

      /**
       * By Default invalid value is created
       */
      const filterValue = createFilterValue({
        type: ColumnFilterType.TIMESTAMP,
      });

      triggerFilterChange(selectors.filterTime(), filterValue);

      fireEvent.click(selectors.buttonSave());

      expect(setFilterValue).toHaveBeenCalledWith(undefined);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
