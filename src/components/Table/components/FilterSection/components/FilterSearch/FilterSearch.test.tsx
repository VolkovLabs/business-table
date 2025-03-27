import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';
import { getFilterWithNewType } from '@/utils';

import { FilterSearch } from './FilterSearch';

type Props = React.ComponentProps<typeof FilterSearch>;

describe('FilterSearch', () => {
  /**
   * Props
   */
  const onChange = jest.fn();
  const onSave = jest.fn();
  const onCancel = jest.fn();
  const createValue = (
    params: { value?: string; caseSensitive?: boolean } = {}
  ): ColumnFilterValue & { type: ColumnFilterType.SEARCH } =>
    ({
      ...getFilterWithNewType(ColumnFilterType.SEARCH),
      ...params,
    }) as never;

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.filterSearch);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <FilterSearch
        value={createValue()}
        onChange={onChange}
        onSave={onSave}
        onCancel={onCancel}
        mode={ColumnFilterMode.CLIENT}
        {...(props as any)}
      />
    );
  };

  it('Should allow to change search term', () => {
    const value = createValue({
      value: 'abc',
    });

    render(
      getComponent({
        value,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveValue(value.value);

    fireEvent.change(selectors.root(), { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      value: 'hello',
    });
  });

  it('Should save search term by enter click', () => {
    const value = createValue({
      value: 'abc',
    });

    render(
      getComponent({
        value,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    fireEvent.keyDown(selectors.root(), { key: 'Enter' });

    expect(onSave).toHaveBeenCalled();
  });

  it('Should cancel by escape click', () => {
    const value = createValue({
      value: 'abc',
    });

    render(
      getComponent({
        value,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    fireEvent.keyDown(selectors.root(), { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('Should allow to enable match case', () => {
    const value = createValue({
      value: 'abc',
      caseSensitive: false,
    });

    render(
      getComponent({
        value,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.buttonMatchCase()).toBeInTheDocument();

    fireEvent.click(selectors.buttonMatchCase());

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      caseSensitive: true,
    });
  });

  it('Should allow to disable match case', () => {
    const value = createValue({
      value: 'abc',
      caseSensitive: true,
    });

    render(
      getComponent({
        value,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.buttonMatchCase()).toBeInTheDocument();

    fireEvent.click(selectors.buttonMatchCase());

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      caseSensitive: false,
    });
  });
});
