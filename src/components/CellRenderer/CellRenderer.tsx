import { Field } from '@grafana/data';
import { CellContext } from '@tanstack/react-table';
import React from 'react';

import { CellType, ColumnConfig } from '../../types';
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

  /**
   * Config
   *
   * @type {ColumnConfig}
   */
  config: ColumnConfig;
}

/**
 * Cell Renderer
 * @param config
 * @param field
 * @param renderValue
 */
export const CellRenderer: React.FC<Props> = ({ field, renderValue, config }) => {
  const rawValue = renderValue() as number | string;
  const cellType = config.type || CellType.AUTO;

  switch (cellType) {
    case CellType.AUTO:
    case CellType.COLORED_TEXT: {
      return <DefaultCellRenderer value={rawValue} field={field} config={config} />;
    }
    default: {
      return <DefaultCellRenderer value={rawValue} field={field} config={config} />;
    }
  }
};
