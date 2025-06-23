import { dateTime, FieldType, toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { FilterNumber, FilterSearch, FilterTime } from '@/components/Table/components/FilterSection/components';
import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';
import { createColumnConfig, getFilterWithNewType } from '@/utils';

import { FilterDefaultFacetedList } from '../FilterDefaultFacetedList';
import { FilterValueEditor } from './FilterValueEditor';

type Props = React.ComponentProps<typeof FilterValueEditor>;

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
jest.mock('@/components/Table/components/FilterSection/components', () => ({
  FilterTime: jest.fn(),
  FilterSearch: jest.fn(),
  FilterNumber: jest.fn(),
}));

/**
 * Mock filters
 */
jest.mock('../FilterDefaultFacetedList', () => ({
  FilterDefaultFacetedList: jest.fn(),
}));

describe('FilterValueEditor', () => {
  /**
   * Props
   */
  const onClose = jest.fn();
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.filterValueEditor,
    ...inTestIds,
  });

  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = ({ data, ...restProps }: Partial<Props>) => {
    return <FilterValueEditor onClose={onClose} data={data} onChange={onChange} {...(restProps as any)} />;
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
    jest.mocked(FilterDefaultFacetedList).mockImplementation(FilterFacetedMock);
    jest.mocked(FilterTime).mockImplementation(FilterTimeMock);
  });

  it('Should render', () => {
    const onChange = jest.fn();

    /**
     * Data Frame A
     */
    const dataFrameA = toDataFrame({
      fields: [
        {
          name: 'field1',
          type: FieldType.other,
        },
        {
          name: 'field2',
          type: FieldType.string,
        },
      ],
      refId: 'A',
    });

    render(
      getComponent({
        value: createColumnConfig({
          field: {
            name: 'field1',
            source: 'A',
          },
          filter: { enabled: true, mode: ColumnFilterMode.CLIENT, variable: '' },
        }),
        data: [dataFrameA],
        onChange,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should not render type if no options', () => {
    const onChange = jest.fn();

    /**
     * Data Frame A
     */
    const dataFrameA = toDataFrame({
      fields: [
        {
          name: 'field1',
          type: FieldType.other,
        },
        {
          name: 'field2',
          type: FieldType.string,
        },
      ],
      refId: 'A',
    });

    render(
      getComponent({
        value: createColumnConfig({
          field: {
            name: 'field',
            source: 'A',
          },
          filter: { enabled: true, mode: ColumnFilterMode.CLIENT, variable: '' },
        }),
        data: [dataFrameA],
        onChange,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.fieldType(true)).not.toBeInTheDocument();
  });

  it('Should allow to use search client filter', async () => {
    const onChange = jest.fn();

    /**
     * Data Frame A
     */
    const dataFrameA = toDataFrame({
      fields: [
        {
          name: 'field1',
          type: FieldType.string,
        },
        {
          name: 'field2',
          type: FieldType.string,
        },
      ],
      refId: 'A',
    });

    render(
      getComponent({
        value: createColumnConfig({
          field: {
            name: 'field1',
            source: 'A',
          },
          filter: { enabled: true, mode: ColumnFilterMode.CLIENT, variable: '' },
        }),
        data: [dataFrameA],
        onChange,
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
    expect(onChange).toHaveBeenCalled();
  });

  it('Should allow to use number client filter', async () => {
    const onChange = jest.fn();

    /**
     * Data Frame A
     */
    const dataFrameA = toDataFrame({
      fields: [
        {
          name: 'field1',
          type: FieldType.number,
        },
        {
          name: 'field2',
          type: FieldType.string,
        },
      ],
      refId: 'A',
    });

    render(
      getComponent({
        value: createColumnConfig({
          field: {
            name: 'field1',
            source: 'A',
          },
          filter: { enabled: true, mode: ColumnFilterMode.CLIENT, variable: '' },
        }),
        data: [dataFrameA],
        onChange,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.filterNumber()).toBeInTheDocument();

    const filterValue = createFilterValue({
      type: ColumnFilterType.NUMBER,
      value: [15, 10],
    });

    triggerFilterChange(selectors.filterNumber(), filterValue);

    fireEvent.click(selectors.buttonSave());
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({
          defaultClientValue: { operator: '>', type: 'number', value: [15, 10] },
        }),
      })
    );
  });

  it('Should allow to use Time client filter', async () => {
    const onChange = jest.fn();

    /**
     * Data Frame A
     */
    const dataFrameA = toDataFrame({
      fields: [
        {
          name: 'field1',
          type: FieldType.time,
        },
        {
          name: 'field2',
          type: FieldType.string,
        },
      ],
      refId: 'A',
    });

    render(
      getComponent({
        value: createColumnConfig({
          field: {
            name: 'field1',
            source: 'A',
          },
          filter: { enabled: true, mode: ColumnFilterMode.CLIENT, variable: '' },
        }),
        data: [dataFrameA],
        onChange,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.filterTime()).toBeInTheDocument();

    const filterValue = createFilterValue({
      type: ColumnFilterType.TIMESTAMP,
      value: {
        from: dateTime('2025-05-05'),
        to: dateTime('2025-05-05'),
        raw: {
          from: dateTime('2025-05-05'),
          to: dateTime('2025-05-05'),
        },
      },
    });

    triggerFilterChange(selectors.filterTime(), filterValue);

    fireEvent.click(selectors.buttonSave());
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({
          defaultClientValue: {
            type: ColumnFilterType.TIMESTAMP,
            value: {
              from: dateTime('2025-05-05'),
              to: dateTime('2025-05-05'),
              raw: {
                from: dateTime('2025-05-05'),
                to: dateTime('2025-05-05'),
              },
            },
          },
        }),
      })
    );
  });

  it('Should allow to use FACETED client filter', async () => {
    const onChange = jest.fn();

    /**
     * Data Frame A
     */
    const dataFrameA = toDataFrame({
      fields: [
        {
          name: 'field1',
          type: FieldType.string,
        },
        {
          name: 'field2',
          type: FieldType.string,
        },
      ],
      refId: 'A',
    });

    render(
      getComponent({
        value: createColumnConfig({
          field: {
            name: 'field1',
            source: 'A',
          },
          filter: { enabled: true, mode: ColumnFilterMode.CLIENT, variable: '' },
        }),
        data: [dataFrameA],
        onChange,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.filterSearch()).toBeInTheDocument();
    fireEvent.click(selectors.typeOption(false, ColumnFilterType.FACETED));
    expect(selectors.filterFaceted()).toBeInTheDocument();

    const filterValue = createFilterValue({
      type: ColumnFilterType.FACETED,
      value: ['a', 'b'],
    });

    triggerFilterChange(selectors.filterFaceted(), filterValue);
    fireEvent.click(selectors.buttonSave());

    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({
          defaultClientValue: {
            type: ColumnFilterType.FACETED,
            value: ['a', 'b'],
          },
        }),
      })
    );
  });

  it('Should allow to use Clear client filter', async () => {
    const onChange = jest.fn();

    /**
     * Data Frame A
     */
    const dataFrameA = toDataFrame({
      fields: [
        {
          name: 'field1',
          type: FieldType.string,
        },
        {
          name: 'field2',
          type: FieldType.string,
        },
      ],
      refId: 'A',
    });

    render(
      getComponent({
        value: createColumnConfig({
          field: {
            name: 'field1',
            source: 'A',
          },
          filter: {
            enabled: true,
            mode: ColumnFilterMode.CLIENT,
            variable: '',
            defaultClientValue: {
              type: ColumnFilterType.FACETED,
              value: ['a', 'b'],
            },
          },
        }),
        data: [dataFrameA],
        onChange,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    fireEvent.click(selectors.typeOption(false, ColumnFilterType.FACETED));
    expect(selectors.filterFaceted()).toBeInTheDocument();

    const filterValue = createFilterValue({
      type: ColumnFilterType.FACETED,
      value: ['a', 'c'],
    });

    triggerFilterChange(selectors.filterFaceted(), filterValue);
    fireEvent.click(selectors.buttonClear());

    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({
          defaultClientValue: undefined,
        }),
      })
    );
  });
});
