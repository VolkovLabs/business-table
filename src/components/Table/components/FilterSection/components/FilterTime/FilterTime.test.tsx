import { TimeRange } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterType, ColumnFilterValue } from '@/types';
import { getFilterWithNewType } from '@/utils';

import { FilterTime } from './FilterTime';

type Props = React.ComponentProps<typeof FilterTime>;

describe('FilterTime', () => {
  /**
   * Props
   */
  const onChange = jest.fn();
  const createValue = (params: { value?: TimeRange } = {}): ColumnFilterValue & { type: ColumnFilterType.TIMESTAMP } =>
    ({
      ...getFilterWithNewType(ColumnFilterType.TIMESTAMP),
      ...params,
    }) as never;

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.filterTime);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <FilterTime value={createValue()} onChange={onChange} {...(props as any)} />;
  };

  it('Should allow to change value', () => {
    const value = createValue();

    render(getComponent({ value }));

    expect(selectors.root()).toBeInTheDocument();

    fireEvent.change(selectors.root(), { target: { value: '123' } });

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      value: '123',
    });
  });
});
