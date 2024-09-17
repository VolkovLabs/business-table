import { SelectableValue } from '@grafana/data';
import React from 'react';

export const ButtonSelect = ({ onChange, options, value, ...restProps }: any) => {
  return (
    <select
      onChange={(event) => {
        const plainOptions = options.reduce(
          (acc: SelectableValue[], option: SelectableValue) => acc.concat(option.options ? option.options : option),
          []
        );
        // eslint-disable-next-line
        const option = plainOptions.find((option: any) => option.value == event.target.value);

        onChange(option);
      }}
      value={value?.value || value}
      {...restProps}
    >
      {options
        .reduce(
          (acc: SelectableValue[], option: SelectableValue) => acc.concat(option.options ? option.options : option),
          []
        )
        .map(({ label, value }: any, index: number) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
    </select>
  );
};
