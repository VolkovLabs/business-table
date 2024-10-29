import { DataFrame } from '@grafana/data';
import { InlineField, InlineFieldRow } from '@grafana/ui';
import React, { useMemo } from 'react';

import { FieldPicker } from '@/components';
import { TEST_IDS } from '@/constants';
import { EditorProps, FieldSource, QueryOptionsMapper } from '@/types';

/**
 * Properties
 */
interface Props extends EditorProps<QueryOptionsMapper | undefined> {
  /**
   * Data
   */
  data: DataFrame[];
}

/**
 * Element Query Options Editor
 */
export const QueryOptionsEditor: React.FC<Props> = ({ value, onChange, data }) => {
  /**
   * Value Field Source
   */
  const valueFieldSource = useMemo((): FieldSource | undefined => {
    if (value) {
      return {
        source: value.source,
        name: value.value,
      };
    }

    return undefined;
  }, [value]);

  return (
    <>
      <InlineFieldRow>
        <InlineField label="Value Field" grow={true}>
          <FieldPicker
            value={valueFieldSource}
            onChange={(valueField) => {
              onChange(
                valueField
                  ? {
                      source: valueField.source,
                      value: valueField.name,
                      label: value?.source !== valueField.source ? null : value?.label || null,
                    }
                  : undefined
              );
            }}
            data={data}
            isClearable={true}
            {...TEST_IDS.queryOptionsEditor.fieldValue.apply()}
          />
        </InlineField>
      </InlineFieldRow>
      {value?.value && (
        <InlineFieldRow>
          <InlineField label="Label Field" grow={true}>
            <FieldPicker
              value={valueFieldSource ? { source: valueFieldSource.source, name: value.label || '' } : undefined}
              onChange={(option) =>
                onChange({
                  ...value,
                  label: option ? option.name : null,
                })
              }
              data={data}
              alreadySelectedFields={valueFieldSource ? [valueFieldSource] : undefined}
              isClearable={true}
              {...TEST_IDS.queryOptionsEditor.fieldLabel.apply()}
            />
          </InlineField>
        </InlineFieldRow>
      )}
    </>
  );
};
