import { CellContext } from '@tanstack/react-table';
import React from 'react';

import { CellType } from '@/types';

import { DefaultCellRenderer } from './DefaultCellRenderer';

/**
 * Properties
 */
interface Props extends CellContext<unknown, unknown> {
  /**
   * Bg Color
   *
   * @type {string}
   */
  bgColor?: string;
}

/**
 * Cell Renderer
 */
export const CellRenderer: React.FC<Props> = ({ renderValue, column, bgColor }) => {
  /**
   * No meta
   */
  if (!column.columnDef.meta) {
    return null;
  }

  const { config, field } = column.columnDef.meta;

  const rawValue = renderValue() as number | string;

  const cellType = config.type || CellType.AUTO;

  switch (cellType) {
    case CellType.AUTO:
    case CellType.COLORED_TEXT:
    case CellType.COLORED_BACKGROUND: {
      return <DefaultCellRenderer value={rawValue} field={field} config={config} bgColor={bgColor} />;
    }
    default: {
      return <DefaultCellRenderer value={rawValue} field={field} config={config} bgColor={bgColor} />;
    }
  }
};
