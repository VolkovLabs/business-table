import React, { useCallback } from 'react';
import { Field, Select } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';

import { CellOptions, CellType } from '../../types';

/**
 * Properties
 */
interface Props extends StandardEditorProps<CellOptions> {}

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
 * Cell Options Editor
 */
export const CellOptionsEditor: React.FC<Props> = ({ value, onChange }) => {
  /**
   * Change Field
   */
  const onChangeField = useCallback(
    (fieldName: keyof CellOptions, fieldValue: CellOptions[typeof fieldName]) => {
      onChange({
        ...value,
        [fieldName]: fieldValue,
      });
    },
    [value, onChange]
  );

  return (
    <div>
      <Field label="Cell Type">
        <Select
          options={cellTypeOptions}
          value={value.type}
          onChange={(value) => {
            onChangeField('type', value.value!);
          }}
        />
      </Field>
    </div>
  );
};
