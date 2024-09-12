import { DataFrame, FieldType, SelectableValue } from '@grafana/data';
import { Select, SelectBaseProps } from '@grafana/ui';
import React, { useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { FieldSource } from '@/types';

import { getFieldKey, getFieldOption } from './utils';

/**
 * Properties
 */
interface Props extends Omit<SelectBaseProps<string>, 'value' | 'onChange' | 'options'> {
  /**
   * Value
   *
   * @type {FieldSource}
   */
  value?: FieldSource;

  /**
   * Change
   */
  onChange: (value: FieldSource | undefined) => void;

  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];

  /**
   * Filter Field
   *
   * @type {FieldSource[]}
   */
  alreadySelectedFields?: FieldSource[];

  /**
   * Include Types
   *
   * @type {FieldType[]}
   */
  includeTypes?: FieldType[];
}

/**
 * Field Picker
 */
export const FieldPicker: React.FC<Props> = ({
  data,
  value,
  onChange,
  alreadySelectedFields,
  includeTypes,
  ...restProps
}) => {
  /**
   * Available Field Options
   */
  const availableFieldOptions = useMemo(() => {
    const filterField = alreadySelectedFields?.[0];

    /**
     * Take fields within selected frame
     */
    if (filterField) {
      const dataFrameIndex = data.findIndex((dataFrame, index) =>
        dataFrame.refId === undefined ? index === filterField.source : dataFrame.refId === filterField.source
      );
      const dataFrame = data[dataFrameIndex];

      if (dataFrame) {
        const source = dataFrame.refId || dataFrameIndex;

        return (
          dataFrame.fields
            .filter((field) => (includeTypes ? includeTypes.includes(field.type) : true))
            .map((field) => getFieldOption(field, source))
            .filter((option) => !alreadySelectedFields.some((item) => item.name === option.fieldName)) || []
        );
      }
    }

    return data.reduce((acc: SelectableValue[], dataFrame, index) => {
      return acc.concat(
        dataFrame.fields
          .filter((field) => (includeTypes ? includeTypes.includes(field.type) : true))
          .map((field) => {
            const source = dataFrame.refId || index;

            return getFieldOption(field, source);
          })
      );
    }, []);
  }, [alreadySelectedFields, data, includeTypes]);

  /**
   * Select Value
   */
  const selectValue = useMemo(() => {
    if (value) {
      return getFieldKey(value.source, value.name);
    }

    return null;
  }, [value]);

  return (
    <Select
      options={availableFieldOptions}
      value={selectValue}
      onChange={(event) => {
        onChange(
          event
            ? {
                source: event.source,
                name: event.fieldName,
              }
            : undefined
        );
      }}
      {...TEST_IDS.fieldPicker.root.apply()}
      {...restProps}
    />
  );
};
