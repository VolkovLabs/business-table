import { FieldType, toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterType, ColumnFilterValue } from '@/types';
import { getFilterWithNewType } from '@/utils';

import { FilterDefaultFacetedList } from './FilterDefaultFacetedList';

type Props = React.ComponentProps<typeof FilterDefaultFacetedList>;

describe('FilterFacetedList', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Option Names
   */
  const optionsNameMap = {
    active: 'active',
    pending: 'pending',
  };

  /**
   * Create Value
   * @param params
   */
  const createValue = (params: { value?: string[] } = {}): ColumnFilterValue & { type: ColumnFilterType.FACETED } =>
    ({
      ...getFilterWithNewType(ColumnFilterType.FACETED),
      ...params,
    }) as never;

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.filterDefaultFacetedList);
  const selectors = getSelectors(screen);

  /**
   * Data Frame A
   */
  const dataFrameA = toDataFrame({
    fields: [
      {
        name: 'field1',
        type: FieldType.string,
        values: [optionsNameMap.active, optionsNameMap.pending],
      },
      {
        name: 'field2',
        type: FieldType.string,
      },
    ],
    refId: 'A',
  });

  const uniqueValuesMap = new Map();
  uniqueValuesMap.set(optionsNameMap.active, 1);
  uniqueValuesMap.set(optionsNameMap.pending, 1);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <FilterDefaultFacetedList onChange={onChange} value={createValue()} {...(props as any)} />;
  };

  it('Should render list', () => {
    const onChange = jest.fn();

    render(
      getComponent({
        onChange,
        filterValue: createValue({ value: [optionsNameMap.pending] }),
        field: dataFrameA.fields[0],
      })
    );

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should allow to select value', () => {
    const onChange = jest.fn();

    render(
      getComponent({
        onChange,
        filterValue: createValue({ value: [optionsNameMap.pending] }),
        field: dataFrameA.fields[0],
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.option(false, optionsNameMap.active)).toBeInTheDocument();
    expect(selectors.option(false, optionsNameMap.active)).not.toBeChecked();

    fireEvent.click(selectors.option(false, optionsNameMap.active));

    expect(onChange).toHaveBeenCalledWith(createValue({ value: [optionsNameMap.pending, optionsNameMap.active] }));
  });

  it('Should allow to deselect value', () => {
    const onChange = jest.fn();

    render(
      getComponent({
        onChange,
        filterValue: createValue({ value: [optionsNameMap.pending] }),
        field: dataFrameA.fields[0],
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.option(false, optionsNameMap.pending)).toBeInTheDocument();
    expect(selectors.option(false, optionsNameMap.pending)).toBeChecked();

    fireEvent.click(selectors.option(false, optionsNameMap.pending));

    expect(onChange).toHaveBeenCalledWith(createValue({ value: [] }));
  });

  it('Should allow to select all values', () => {
    const onChange = jest.fn();

    render(
      getComponent({
        onChange,
        filterValue: createValue({ value: [] }),
        field: dataFrameA.fields[0],
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.allOption()).toBeInTheDocument();
    expect(selectors.allOption()).not.toBeChecked();

    fireEvent.click(selectors.allOption());

    expect(onChange).toHaveBeenCalledWith(createValue({ value: [optionsNameMap.active, optionsNameMap.pending] }));
  });

  it('Should allow to deselect all values', () => {
    const onChange = jest.fn();

    render(
      getComponent({
        onChange,
        filterValue: createValue({ value: [optionsNameMap.active, optionsNameMap.pending] }),
        field: dataFrameA.fields[0],
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.allOption()).toBeInTheDocument();
    expect(selectors.allOption()).toBeChecked();

    fireEvent.click(selectors.allOption());

    expect(onChange).toHaveBeenCalledWith(createValue({ value: [] }));
  });
});
