import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterType, ColumnFilterValue, NumberFilterOperator } from '@/types';
import { getFilterWithNewType } from '@/utils';

import { FilterNumber } from './FilterNumber';

type Props = React.ComponentProps<typeof FilterNumber>;

describe('FilterNumber', () => {
  /**
   * Props
   */
  const onChange = jest.fn();
  const createValue = (
    params: { value?: [number, number]; operator?: NumberFilterOperator } = {}
  ): ColumnFilterValue & { type: ColumnFilterType.NUMBER } =>
    ({
      ...getFilterWithNewType(ColumnFilterType.NUMBER),
      ...params,
    }) as never;

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.filterNumber);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <FilterNumber value={createValue()} onChange={onChange} {...(props as any)} />;
  };

  it('Should allow to change operator', () => {
    const value = createValue({
      operator: NumberFilterOperator.MORE_OR_EQUAL,
    });

    render(getComponent({ value }));

    expect(selectors.fieldOperator()).toBeInTheDocument();
    expect(selectors.fieldOperator()).toHaveValue(value.operator);

    fireEvent.change(selectors.fieldOperator(), { target: { value: NumberFilterOperator.LESS } });

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      operator: NumberFilterOperator.LESS,
    });
  });

  it('Should allow to change value', () => {
    const value = createValue({
      value: [10, 0],
    });

    render(getComponent({ value }));

    expect(selectors.fieldValue()).toBeInTheDocument();
    expect(selectors.fieldValue()).toHaveValue('10');

    fireEvent.change(selectors.fieldValue(), { target: { value: 15 } });
    fireEvent.blur(selectors.fieldValue());

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      value: [15, 0],
    });
  });

  it('Should hide additional value if not between operator', () => {
    const value = createValue({
      operator: NumberFilterOperator.LESS,
    });

    render(getComponent({ value }));

    expect(selectors.fieldAdditionalValue(true)).not.toBeInTheDocument();
  });

  it('Should allow to change additional value', () => {
    const value = createValue({
      operator: NumberFilterOperator.BETWEEN,
      value: [10, 15],
    });

    render(getComponent({ value }));

    expect(selectors.fieldAdditionalValue()).toBeInTheDocument();
    expect(selectors.fieldAdditionalValue()).toHaveValue('15');

    fireEvent.change(selectors.fieldAdditionalValue(), { target: { value: 20 } });
    fireEvent.blur(selectors.fieldAdditionalValue());

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      value: [10, 20],
    });
  });
});
