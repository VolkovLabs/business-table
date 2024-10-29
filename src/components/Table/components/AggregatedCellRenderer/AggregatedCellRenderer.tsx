import { FormattedValueDisplay } from '@grafana/ui';
import { CellContext } from '@tanstack/react-table';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { CellAggregation } from '@/types';

/**
 * Properties
 */
type Props = CellContext<unknown, unknown>;

/**
 * Aggregation Type acceptable for display processor
 */
export const acceptableAggregationType = [
  CellAggregation.MIN,
  CellAggregation.MAX,
  CellAggregation.MEAN,
  CellAggregation.MEDIAN,
  CellAggregation.SUM,
];

/**
 * Aggregated Cell Renderer
 */
export const AggregatedCellRenderer: React.FC<Props> = ({ renderValue, column }) => {
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
  if (field.display && acceptableAggregationType.includes(config.aggregation)) {
    const displayValue = field.display(value);

    return (
      <span {...TEST_IDS.aggregatedCellRenderer.root.apply()}>
        <FormattedValueDisplay value={displayValue} />
      </span>
    );
  }

  return <span {...TEST_IDS.aggregatedCellRenderer.root.apply()}>{value}</span>;
};
