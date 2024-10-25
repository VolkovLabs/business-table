import { FormattedValueDisplay, useTheme2 } from '@grafana/ui';
import { CellContext } from '@tanstack/react-table';
import React from 'react';

import { ACCEPTABLE_AGGREGATION_TYPE, TEST_IDS } from '@/constants';

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
  if (field.display && ACCEPTABLE_AGGREGATION_TYPE.includes(config.aggregation)) {
    const displayValue = field.display(value);

    return (
      <span
        style={{
          color: bgColor ? theme.colors.getContrastText(bgColor) : 'inherit',
        }}
        {...TEST_IDS.aggregatedCellRenderer.root.apply()}
      >
        <FormattedValueDisplay value={displayValue} />
      </span>
    );
  }

  return <span {...TEST_IDS.aggregatedCellRenderer.root.apply()}>{value}</span>;
};
