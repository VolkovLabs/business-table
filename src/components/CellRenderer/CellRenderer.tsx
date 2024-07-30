import { Field, FieldConfig } from '@grafana/data';
import { FormattedValueDisplay } from '@grafana/ui';
import { CellContext } from '@tanstack/react-table';
import React, { ReactElement } from 'react';

import { CellType, FieldSettings } from '../../types';

/**
 * Properties
 */
interface Props extends CellContext<unknown, unknown> {
  /**
   * Field
   *
   * @type {Field}
   */
  field: Field;
}

/**
 * Cell Renderer
 * @param field
 * @param renderValue
 * @constructor
 */
export const CellRenderer: React.FC<Props> = ({ field, renderValue }) => {
  /**
   * Field Config
   */
  const fieldConfig: FieldConfig<FieldSettings> = field.config;
  const cellOptions = fieldConfig.custom?.cellOptions;

  const rawValue = renderValue() as string | number;
  let formattedValue: string | number | ReactElement = rawValue;
  let color = 'inherit';

  if (field.display) {
    const displayValue = field.display(rawValue);

    if (displayValue.color) {
      color = displayValue.color;
    }

    formattedValue = <FormattedValueDisplay value={displayValue} />;
  }

  return (
    <span
      style={{
        color: cellOptions?.type === CellType.COLORED_TEXT ? color : 'inherit',
      }}
    >
      {formattedValue}
    </span>
  );
};
