import { DataFrame } from '@grafana/data';
import { Select } from '@grafana/ui';
import React, { useMemo } from 'react';

import { FieldSource } from '../../types';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {FieldSource}
   */
  value?: FieldSource;

  /**
   * On Change
   */
  onChange: (value?: FieldSource) => void;

  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];
}

interface FieldPickerOption {
  /**
   * Ref ID
   *
   * @type {string}
   */
  refId?: string;

  /**
   * Value
   *
   * @type {string}
   */
  value: string;

  /**
   * Label
   *
   * @type {string}
   */
  label: string;

  /**
   * Field Name
   *
   * @type {string}
   */
  name: string;
}

/**
 * Field Picker
 */
export const FieldPicker: React.FC<Props> = ({ value, onChange, data }) => {
  /**
   * Field Value
   */
  const fieldValue = useMemo(() => {
    if (!value) {
      return null;
    }

    if (value.refId) {
      return `${value.refId}:${value.name}`;
    }

    return value.name;
  }, [value]);

  /**
   * Options
   */
  const options = useMemo(() => {
    return data.reduce((acc, frame) => {
      return acc.concat(
        frame.fields.map(({ name }): FieldPickerOption => {
          const value = frame.refId ? `${frame.refId}:${name}` : name;

          return {
            refId: frame.refId,
            name,
            label: value,
            value,
          };
        })
      );
    }, [] as FieldPickerOption[]);
  }, [data]);

  return (
    <Select
      value={fieldValue}
      options={options}
      onChange={(option) => {
        onChange(
          option
            ? {
                refId: option.refId,
                name: option.name,
              }
            : undefined
        );
      }}
    />
  );
};
