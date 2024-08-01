import React from 'react';
import { SelectableValue } from '@grafana/data';

const actual = jest.requireActual('@grafana/ui');

/**
 * Button
 */
const Button = jest.fn(({ children, ...restProps }) => <button {...restProps}>{children}</button>);

/**
 * Mock Select component
 */
const Select = jest.fn(
  ({
    options,
    onChange,
    value,
    isMulti,
    isClearable,
    allowCustomValue,
    invalid,
    noOptionsMessage,
    formatOptionLabel,
    isLoading,
    onOpenMenu,
    onCloseMenu,
    ...restProps
  }) => (
    <select
      onChange={(event: any) => {
        if (onChange) {
          if (isMulti) {
            const newOptions = allowCustomValue
              ? event.target.values.map((value: string) => ({
                  value,
                }))
              : options.filter((option: any) => event.target.values.includes(option.value));
            onChange(newOptions);
          } else {
            const plainOptions = options.reduce(
              (acc: SelectableValue[], option: SelectableValue) => acc.concat(option.options ? option.options : option),
              []
            );
            // eslint-disable-next-line eqeqeq
            onChange(plainOptions.find((option: any) => option.value == event.target.value));
          }
        }
      }}
      /**
       * Fix jest warnings because null value.
       * For Select component in @grafana/ui should be used null to reset value.
       */
      value={value === null ? '' : value?.value || value}
      multiple={isMulti}
      {...restProps}
    >
      {isClearable && (
        <option key="clear" value="">
          Clear
        </option>
      )}
      {(allowCustomValue
        ? (Array.isArray(value) ? value : [value])
            .map((value: string) => ({
              value,
              label: value,
            }))
            .concat(options.filter((option: any) => option.value !== value))
        : options.reduce(
            (acc: SelectableValue[], option: SelectableValue) => acc.concat(option.options ? option.options : option),
            []
          )
      ).map(({ label, value }: any, index: number) => (
        <option key={index} value={value}>
          {label}
        </option>
      ))}
    </select>
  )
);

module.exports = {
  ...actual,
  Select,
  Button,
};
