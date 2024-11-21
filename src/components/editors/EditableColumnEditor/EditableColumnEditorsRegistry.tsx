import { dateTime } from '@grafana/data';
import { DateTimePicker, InlineField, InlineFieldRow, InlineSwitch, Input, Select, TextArea } from '@grafana/ui';
import { NumberInput } from '@volkovlabs/components';
import React, { ChangeEvent } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnEditorType } from '@/types';
import {
  cleanPayloadObject,
  createEditableColumnEditorRegistryItem,
  createEditableColumnEditorsRegistry,
  formatNumberValue,
} from '@/utils';

import { DateEditor, QueryOptionsEditor } from './components';

/**
 * Editable Column Editors Registry
 */
export const editableColumnEditorsRegistry = createEditableColumnEditorsRegistry([
  createEditableColumnEditorRegistryItem({
    id: ColumnEditorType.STRING,
    editor: () => null,
    control: ({ value, onChange, isSaving }) => (
      <Input
        value={value as string}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
        style={{ width: '100%' }}
        disabled={isSaving}
        {...TEST_IDS.editableCell.fieldString.apply()}
      />
    ),
    getControlOptions: (params) => params.config,
  }),
  createEditableColumnEditorRegistryItem({
    id: ColumnEditorType.TEXTAREA,
    editor: () => null,
    control: ({ value, onChange, isSaving }) => (
      <TextArea
        value={(value as string).replaceAll('\\n', '\n')}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
          onChange(event.target.value.replaceAll('\n', '\\n'));
        }}
        disabled={isSaving}
        {...TEST_IDS.editableCell.fieldTextarea.apply()}
      />
    ),
    getControlOptions: (params) => params.config,
  }),
  createEditableColumnEditorRegistryItem({
    id: ColumnEditorType.NUMBER,
    editor: ({ value, onChange }) => (
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
            {...TEST_IDS.editableColumnEditor.fieldNumberMin.apply()}
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
            {...TEST_IDS.editableColumnEditor.fieldNumberMax.apply()}
          />
        </InlineField>
      </InlineFieldRow>
    ),
    control: ({ value, onChange, config }) => (
      <NumberInput
        value={value as number}
        onChange={onChange}
        min={config.min}
        max={config.max}
        {...TEST_IDS.editableCell.fieldNumber.apply()}
      />
    ),
    getControlOptions: (params) => params.config,
  }),
  createEditableColumnEditorRegistryItem({
    id: ColumnEditorType.DATETIME,
    editor: ({ value, onChange }) => (
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
    ),
    control: ({ value, onChange, config }) => (
      <DateTimePicker
        date={dateTime(value ? (value as string) : undefined)}
        onChange={(date) => onChange(date?.toISOString())}
        minDate={config.min ? new Date(config.min) : undefined}
        maxDate={config.max ? new Date(config.max) : undefined}
        {...TEST_IDS.editableCell.fieldDatetime.apply()}
      />
    ),
    getControlOptions: (params) => params.config,
  }),
  createEditableColumnEditorRegistryItem({
    id: ColumnEditorType.SELECT,
    editor: ({ value, onChange, data }) => (
      <>
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
        <InlineFieldRow>
          <InlineField label="Allow custom values" grow={true}>
            <InlineSwitch
              value={value.customValues}
              onChange={(event) =>
                onChange(
                  cleanPayloadObject({
                    ...value,
                    customValues: event.currentTarget.checked,
                  })
                )
              }
              {...TEST_IDS.editableColumnEditor.fieldCustomValues.apply()}
            />
          </InlineField>
        </InlineFieldRow>
      </>
    ),
    control: ({ value, onChange, config }) => {
      return (
        <Select
          value={value}
          onChange={(event) => onChange(event.value)}
          options={config.options}
          allowCustomValue={config.customValues}
          {...TEST_IDS.editableCell.fieldSelect.apply()}
        />
      );
    },
    getControlOptions: ({ config, data }) => {
      const queryOptions = config.queryOptions;

      const controlOptions = {
        type: config.type,
        customValues: config.customValues ?? false,
        options: [],
      };

      if (!queryOptions || !queryOptions.value) {
        return controlOptions;
      }

      const frame = data.series.find((frame) => frame.refId === queryOptions.source);
      const valueField = frame?.fields.find((field) => field.name === queryOptions.value);

      if (!frame || !valueField) {
        return controlOptions;
      }

      const labelValues = frame?.fields.find((field) => field.name === queryOptions.label)?.values || valueField.values;

      return {
        ...controlOptions,
        options: valueField.values.map((value, index) => ({
          value,
          label: labelValues[index] as string,
        })),
      };
    },
  }),
]);
