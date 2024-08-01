import { DataFrame } from '@grafana/data';
import { InlineField, Input, Select } from '@grafana/ui';
import React, { useMemo } from 'react';

import { CellType, ColumnConfig } from '../../types';
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
    </>
  );
};
