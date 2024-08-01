import { DataFrame } from '@grafana/data';
import { InlineField, Input } from '@grafana/ui';
import React, { useMemo } from 'react';

import { ColumnConfig } from '../../types';
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
 * Column Editor
 */
export const ColumnEditor: React.FC<Props> = ({ value, onChange, data }) => {
  const field = useMemo(() => {
    return getFieldBySource(data, value.field);
  }, [data, value.field]);

  return (
    <>
      <InlineField label="Label" grow={true}>
        <Input
          placeholder={field?.config.displayName ?? field?.name}
          onChange={(event) =>
            onChange({
              ...value,
              label: event.currentTarget.value,
            })
          }
        />
      </InlineField>
    </>
  );
};
