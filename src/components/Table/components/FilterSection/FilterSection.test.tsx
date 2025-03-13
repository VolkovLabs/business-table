import { dateTime } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';
import { getFilterWithNewType } from '@/utils';

import { FilterFacetedList, FilterNumber, FilterSearch, FilterTime } from './components';
import { FilterSection } from './FilterSection';

type Props = React.ComponentProps<typeof FilterSection>;

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

describe('FilterSection', () => {
  /**
   * Props
   */
  const onClose = jest.fn();
  const onChange = jest.fn();
  const setFilter = jest.fn();
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.filterSection,
    ...inTestIds,
  });

  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = ({ header, ...restProps }: Partial<Props>) => {
    return (
      <FilterSection
        onClose={onClose}
        header={header}
        onChange={onChange}
        setFilter={setFilter}
        {...(restProps as any)}
      />
    );
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
    const setFilterValue = jest.fn();

    render(
      getComponent({
        filter: {
          type: 'none',
        },
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

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should allow to use client filter', async () => {
    const setFilterValue = jest.fn();

    render(
      getComponent({
        filter: {
          type: ColumnFilterType.SEARCH,
          caseSensitive: true,
          value: '',
        },
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

    expect(onChange).toHaveBeenCalled();
  });

  it('Should allow to change filter type if several', () => {
    render(
      getComponent({
        filter: {
          type: ColumnFilterType.SEARCH,
          caseSensitive: true,
          value: '',
        },
        header: {
          column: {
            getFilterValue: () => undefined,
            columnDef: {
              meta: {
                filterMode: ColumnFilterMode.CLIENT,
                availableFilterTypes: [ColumnFilterType.SEARCH, ColumnFilterType.FACETED, ColumnFilterType.TIMESTAMP],
              },
            },
          },
        } as any,
      })
    );

    expect(selectors.filterSearch()).toBeInTheDocument();
    fireEvent.click(selectors.typeOption(false, ColumnFilterType.FACETED));
    expect(onChange).toHaveBeenCalled();
  });

  it('Should not show options if no availableFilterTypes ', () => {
    render(
      getComponent({
        filter: {
          type: ColumnFilterType.SEARCH,
          caseSensitive: true,
          value: '',
        },
        header: {
          column: {
            getFilterValue: () => undefined,
            columnDef: {
              meta: {
                filterMode: ColumnFilterMode.CLIENT,
                availableFilterTypes: null,
              },
            },
          },
        } as any,
      })
    );

    expect(selectors.filterSearch()).toBeInTheDocument();
  });

  it('Should clear client filter if empty', async () => {
    const setFilterValue = jest.fn();

    render(
      getComponent({
        filter: {
          type: ColumnFilterType.SEARCH,
          caseSensitive: true,
          value: '',
        },
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

    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith({
      caseSensitive: false,
      type: 'search',
      value: '',
    });
  });

  describe('Faceted', () => {
    it('Should allow to use client filter', async () => {
      const setFilterValue = jest.fn();

      render(
        getComponent({
          filter: {
            type: ColumnFilterType.FACETED,
            value: ['a', 'b'],
          },
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

      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith({
        type: ColumnFilterType.FACETED,
        value: ['a', 'b'],
      });
    });

    it('Should clear client filter if empty', async () => {
      const setFilterValue = jest.fn();

      render(
        getComponent({
          filter: {
            type: ColumnFilterType.FACETED,
            value: ['a', 'b'],
          },
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

      expect(onChange).toHaveBeenCalledWith({
        type: ColumnFilterType.FACETED,
        value: [],
      });
    });
  });

  describe('Number', () => {
    it('Should allow to use client filter', async () => {
      const setFilterValue = jest.fn();

      render(
        getComponent({
          filter: createFilterValue({
            type: ColumnFilterType.NUMBER,
            value: [0, 10],
          }),
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
        value: [0, 5],
      });

      triggerFilterChange(selectors.filterNumber(), filterValue);

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ColumnFilterType.NUMBER,
          value: [0, 5],
        })
      );
    });
  });

  describe('TimeStamp', () => {
    it('Should allow to use client filter', async () => {
      const setFilterValue = jest.fn();

      render(
        getComponent({
          filter: createFilterValue({
            type: ColumnFilterType.TIMESTAMP,
            value: {
              from: dateTime(),
              to: dateTime(),
              raw: {
                from: dateTime(),
                to: dateTime(),
              },
            },
          }),
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

      expect(onChange).toHaveBeenCalled();
    });

    it('Should clear client filter if empty', async () => {
      const setFilterValue = jest.fn();

      render(
        getComponent({
          filter: createFilterValue({
            type: ColumnFilterType.TIMESTAMP,
            value: {
              from: dateTime(),
              to: dateTime(),
              raw: {
                from: dateTime(),
                to: dateTime(),
              },
            },
          }),
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

      expect(onChange).toHaveBeenCalled();

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ColumnFilterType.TIMESTAMP,
        })
      );
    });
  });
});
