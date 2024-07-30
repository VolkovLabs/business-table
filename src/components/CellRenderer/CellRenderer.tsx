import { FormattedValueDisplay } from '@grafana/ui';
import { Field } from '@grafana/data';
import { CellContext } from '@tanstack/react-table';
import React from 'react';

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
  if (field.display) {
    const value = field.display(renderValue());

    return <FormattedValueDisplay value={value} />;
  }

  return <>{renderValue()}</>;
};
