import { ButtonSelect, InlineField, InlineFieldRow } from '@grafana/ui';
import { NumberInput } from '@volkovlabs/components';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterType, ColumnFilterValue, NumberFilterOperator } from '@/types';

/**
 * Properties
 */
type Value = ColumnFilterValue & { type: ColumnFilterType.NUMBER };

interface Props {
  /**
   * Value
   *
   * @type {Value}
   */
  value: Value;

  /**
   * Change
   */
  onChange: (value: Value) => void;
}

/**
 * Filter Number
 */
export const FilterNumber: React.FC<Props> = ({ value: filterValue, onChange }) => {
  return (
    <InlineFieldRow>
      <ButtonSelect
        options={Object.values(NumberFilterOperator).map((operator) => ({
          label: operator,
          value: operator,
        }))}
        onChange={(item) => {
          onChange({
            ...filterValue,
            operator: item.value!,
          });
        }}
        value={{ value: filterValue.operator }}
        {...TEST_IDS.filterNumber.fieldOperator.apply()}
      />
      <InlineField>
        <NumberInput
          value={filterValue.value[0]}
          onChange={(value) => {
            onChange({
              ...filterValue,
              value: [value, filterValue.value[1]],
            });
          }}
          width={8}
          {...TEST_IDS.filterNumber.fieldValue.apply()}
        />
      </InlineField>
      {filterValue.operator === NumberFilterOperator.BETWEEN && (
        <InlineField label="and" transparent={true}>
          <NumberInput
            value={filterValue.value[1]}
            onChange={(value) => {
              onChange({
                ...filterValue,
                value: [filterValue.value[0], value],
              });
            }}
            width={8}
            {...TEST_IDS.filterNumber.fieldAdditionalValue.apply()}
          />
        </InlineField>
      )}
    </InlineFieldRow>
  );
};
