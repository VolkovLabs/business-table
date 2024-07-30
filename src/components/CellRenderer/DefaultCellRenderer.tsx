import { Field, FieldConfig } from '@grafana/data';
import { FormattedValueDisplay } from '@grafana/ui';
import React, { ReactElement } from 'react';

import { CellType, FieldSettings } from '../../types';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {string | number}
   */
  value: string | number;

  /**
   * Field
   *
   * @type {Field}
   */
  field: Field;
}

/**
 * Default Cell Renderer
 * @param field
 * @param renderValue
 * @constructor
 */
export const DefaultCellRenderer: React.FC<Props> = ({ field, value }) => {
  /**
   * Field Config
   */
  const fieldConfig: FieldConfig<FieldSettings> = field.config;
  const cellOptions = fieldConfig.custom?.cellOptions;

  let formattedValue: typeof value | ReactElement = value;
  let color = 'inherit';

  /**
   * Use displayProcessor
   */
  if (field.display) {
    const displayValue = field.display(value);

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
