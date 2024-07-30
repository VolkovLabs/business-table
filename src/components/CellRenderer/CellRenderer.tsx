import { Field, FieldConfig } from '@grafana/data';
import { CellContext } from '@tanstack/react-table';
import React from 'react';

import { CellType, FieldSettings } from '../../types';
import { DefaultCellRenderer } from './DefaultCellRenderer';

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

  const rawValue = renderValue() as number | string;
  const cellType = cellOptions?.type || CellType.AUTO;

  switch (cellType) {
    case CellType.AUTO:
    case CellType.COLORED_TEXT: {
      return <DefaultCellRenderer value={rawValue} field={field} />;
    }
    default: {
      return <DefaultCellRenderer value={rawValue} field={field} />;
    }
  }
};
