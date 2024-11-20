import { CellContext } from '@tanstack/react-table';
import React from 'react';

import { CellType } from '@/types';

import { BooleanCellRenderer } from './BooleanCellRenderer';
import { DefaultCellRenderer } from './DefaultCellRenderer';
import { LayoutCellRenderer } from './LayoutCellRenderer';

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
export const CellRenderer: React.FC<Props> = ({ renderValue, column, bgColor, row }) => {
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
    case CellType.RICH_TEXT: {
      return <LayoutCellRenderer value={String(rawValue)} row={row} />;
    }
    case CellType.BOOLEAN: {
      return <BooleanCellRenderer value={renderValue() as boolean} />;
    }
    default: {
      return <DefaultCellRenderer value={rawValue} field={field} config={config} bgColor={bgColor} />;
    }
  }
};
