import { DataFrame } from '@grafana/data';
import { InlineField, InlineFieldRow, Input, Select } from '@grafana/ui';
import React, { ChangeEvent } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnEditorConfig, ColumnEditorType } from '@/types';
import { cleanPayloadObject, formatNumberValue, getColumnEditorConfig } from '@/utils';

import { DateEditor, QueryOptionsEditor } from './components';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {ColumnEditorConfig}
   */
  value: ColumnEditorConfig;

  /**
   * Change
   */
  onChange: (value: ColumnEditorConfig) => void;

  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];
}

/**
 * Column Editor Options
 */
const columnEditorOptions = [
  { value: ColumnEditorType.STRING, label: 'String' },
  { value: ColumnEditorType.NUMBER, label: 'Number' },
  { value: ColumnEditorType.SELECT, label: 'Select' },
  { value: ColumnEditorType.DATETIME, label: 'Datetime' },
];

/**
 * Editable Column Editor
 */
export const EditableColumnEditor: React.FC<Props> = ({ value, onChange, data }) => {
  return (
    <>
      <InlineField label="Editor Type" grow={true}>
        <Select
          value={value.type}
          onChange={(event) => {
            onChange(getColumnEditorConfig(event.value!));
          }}
          options={columnEditorOptions}
        />
      </InlineField>
      {value.type === ColumnEditorType.NUMBER && (
        <InlineFieldRow>
          <InlineField label="Min">
            <Input
              type="number"
              value={formatNumberValue(value.min)}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                onChange(
                  cleanPayloadObject({ ...value, min: event.target.value ? Number(event.target.value) : undefined })
                );
              }}
            />
          </InlineField>
          <InlineField label="Max">
            <Input
              type="number"
              value={formatNumberValue(value.max)}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChange(
                  cleanPayloadObject({ ...value, max: event.target.value ? Number(event.target.value) : undefined })
                )
              }
            />
          </InlineField>
        </InlineFieldRow>
      )}
      {value.type === ColumnEditorType.DATETIME && (
        <>
          <DateEditor
            label="Min"
            onChange={(min) =>
              onChange(
                cleanPayloadObject({
                  ...value,
                  min,
                })
              )
            }
            value={value.min}
            data-testid={TEST_IDS.editableColumnEditor.fieldDatetimeMin.selector()}
          />
          <DateEditor
            label="Max"
            onChange={(max) =>
              onChange(
                cleanPayloadObject({
                  ...value,
                  max,
                })
              )
            }
            value={value.max}
            data-testid={TEST_IDS.editableColumnEditor.fieldDatetimeMax.selector()}
          />
        </>
      )}
      {value.type === ColumnEditorType.SELECT && (
        <QueryOptionsEditor
          value={value.queryOptions}
          onChange={(queryOptions) => {
            onChange(
              cleanPayloadObject({
                ...value,
                queryOptions,
              })
            );
          }}
          data={data}
        />
      )}
    </>
  );
};
