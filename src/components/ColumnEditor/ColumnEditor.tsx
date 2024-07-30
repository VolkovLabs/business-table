import { DataFrame } from '@grafana/data';
import { InlineField, Input } from '@grafana/ui';
import React from 'react';

import { ColumnOptions } from '../../types';
import { FieldPicker } from '../FieldPicker';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {ColumnOptions}
   */
  value: ColumnOptions;

  /**
   * On Change
   * @param value
   */
  onChange: (value: ColumnOptions) => void;

  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];
}

/**
 * Column Editor
 */
export const ColumnEditor: React.FC<Props> = ({ value, onChange, data }) => {
  return (
    <div>
      <InlineField label="Label" grow={true}>
        <Input
          value={value.label}
          onChange={(event) => {
            onChange({
              ...value,
              label: event.currentTarget.value ?? '',
            });
          }}
        />
      </InlineField>
      <InlineField label="Field" grow={true}>
        <FieldPicker
          value={value.field}
          onChange={(field) => {
            onChange({
              ...value,
              field,
            });
          }}
          data={data}
        />
      </InlineField>
    </div>
  );
};
