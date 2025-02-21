import { FormattedValueDisplay, useTheme2 } from '@grafana/ui';
import { CellContext } from '@tanstack/react-table';
import React from 'react';

import { AGGREGATION_TYPES_WITH_DISPLAY_PROCESSOR, TEST_IDS } from '@/constants';
import { CellType } from '@/types';

/**
 * Properties
 */
interface Props extends CellContext<unknown, unknown> {
  /**
   * Background Color
   *
   * @type {string}
   */
  bgColor?: string;
}

/**
 * Aggregated Cell Renderer
 */
export const AggregatedCellRenderer: React.FC<Props> = ({ renderValue, column, bgColor }) => {
  /**
   * Theme
   */
  const theme = useTheme2();

  /**
   * No meta
   */
  if (!column.columnDef.meta) {
    return null;
  }

  const { config, field } = column.columnDef.meta;

  const value = renderValue() as number | string;

  /**
   * Use Display Processor
   */
  if (field.display && AGGREGATION_TYPES_WITH_DISPLAY_PROCESSOR.includes(config.aggregation)) {
    const displayValue = field.display(value);

    let color = 'inherit';

    if (displayValue.color) {
      color = displayValue.color;
    }

    return (
      <span
        style={{
          color:
            config.type === CellType.COLORED_TEXT ? color : bgColor ? theme.colors.getContrastText(bgColor) : 'inherit',
        }}
        {...TEST_IDS.aggregatedCellRenderer.root.apply()}
      >
        <FormattedValueDisplay value={displayValue} />
      </span>
    );
  }

  return <span {...TEST_IDS.aggregatedCellRenderer.root.apply()}>{value}</span>;
};
