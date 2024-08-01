import { DataFrame } from '@grafana/data';
import { InlineField, InlineSwitch,Input, Select } from '@grafana/ui';
import React, { useMemo } from 'react';

import { CellAggregation,CellType, ColumnConfig } from '../../types';
import { getFieldBySource } from '../../utils';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {ColumnConfig}
   */
  value: ColumnConfig;

  /**
   * Change
   */
  onChange: (value: ColumnConfig) => void;

  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];
}

/**
 * Cell Type Options
 */
const cellTypeOptions = [
  {
    value: CellType.AUTO,
    label: 'Auto',
  },
  {
    value: CellType.COLORED_TEXT,
    label: 'Colored text',
  },
];

/**
 * Aggregation Options
 */
const aggregationOptions = [
  {
    value: CellAggregation.NONE,
    label: 'None',
  },
  {
    value: CellAggregation.SUM,
    label: 'Sum',
  },
  {
    value: CellAggregation.MIN,
    label: 'Min',
  },
  {
    value: CellAggregation.MAX,
    label: 'Max',
  },
  {
    value: CellAggregation.MEAN,
    label: 'Mean',
  },
  {
    value: CellAggregation.EXTENT,
    label: 'Extent',
  },
  {
    value: CellAggregation.MEDIAN,
    label: 'Median',
  },
  {
    value: CellAggregation.UNIQUE,
    label: 'Unique',
  },
  {
    value: CellAggregation.UNIQUE_COUNT,
    label: 'Unique Count',
  },
  {
    value: CellAggregation.COUNT,
    label: 'Count',
  },
];

/**
 * Column Editor
 */
export const ColumnEditor: React.FC<Props> = ({ value, onChange, data }) => {
  /**
   * Current field
   */
  const field = useMemo(() => {
    return getFieldBySource(data, value.field);
  }, [data, value.field]);

  return (
    <>
      <InlineField label="Label" grow={true}>
        <Input
          value={value.label}
          placeholder={field?.config.displayName ?? field?.name}
          onChange={(event) =>
            onChange({
              ...value,
              label: event.currentTarget.value,
            })
          }
        />
      </InlineField>
      <InlineField label="Type" grow={true}>
        <Select
          options={cellTypeOptions}
          value={value.type}
          onChange={(event) => {
            onChange({
              ...value,
              type: event.value ?? value.type,
            });
          }}
        />
      </InlineField>
      <InlineField label="Group" grow={true}>
        <InlineSwitch
          value={value.group}
          onChange={(event) =>
            onChange({
              ...value,
              group: event.currentTarget.checked,
            })
          }
        />
      </InlineField>
      {!value.group && (
        <InlineField label="Aggregation" grow={true}>
          <Select
            value={value.aggregation}
            options={aggregationOptions}
            onChange={(event) => {
              onChange({
                ...value,
                aggregation: event.value ?? value.aggregation,
              });
            }}
          />
        </InlineField>
      )}
    </>
  );
};
