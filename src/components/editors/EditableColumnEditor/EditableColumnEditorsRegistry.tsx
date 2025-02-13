import { dateTime } from '@grafana/data';
import { DateTimePicker, FileDropzone, InlineField, InlineFieldRow, InlineSwitch, Input, Label, Select, TextArea } from '@grafana/ui';
import { NumberInput } from '@volkovlabs/components';
import React, { ChangeEvent } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnEditorType, EditorFileOptions } from '@/types';
import {
  cleanPayloadObject,
  createEditableColumnEditorRegistryItem,
  createEditableColumnEditorsRegistry,
  formatNumberValue,
} from '@/utils';

import { DateEditor, QueryOptionsEditor } from './components';
import { AppEvents } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';

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
    id: ColumnEditorType.BOOLEAN,
    editor: () => null,
    control: ({ value, onChange, isSaving }) => {
      return (
        <InlineSwitch
          onChange={(event) => {
            onChange(event.currentTarget.checked);
          }}
          disabled={isSaving}
          value={value as boolean}
          {...TEST_IDS.editableCell.fieldBoolean.apply()}
        />
      );
    },
    getControlOptions: (params) => params.config,
  }),
  createEditableColumnEditorRegistryItem({
    id: ColumnEditorType.TEXTAREA,
    editor: () => null,
    control: ({ value, onChange, isSaving }) => (
      <TextArea
        value={typeof value === 'string' ? (value as string).replaceAll('\\n', '\n') : String(value)}
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
    editor: ({ value, onChange }) => {
      return (
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
        <Label>Allow Edit Via Keyboard</Label>
        <InlineSwitch
          onChange={(event) => {
            onChange(
              cleanPayloadObject({
                ...value,
                manualInputIsEnabled: event.currentTarget.checked,
              })
            );
          }}
          value={value.manualInputIsEnabled}
        />
      </>
    )},
    control: ({ value, onChange, config }) => {
      const appEvents = getAppEvents();
      return (
      <div
        onKeyDown={(e:any) => {
          if (!config.manualInputIsEnabled && !['Tab', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            // code to show the toast
            appEvents.publish({
              type: AppEvents.alertWarning.name,
              payload: ['Please click the calendar icon to use the date picker to modify the date']
            });
          }
        }}
        onClick={(e: any) => {
          // If the user clicks on the input while typing is disabled, open the picker
          if (!config.manualInputIsEnabled && e.target.tagName.toLowerCase() === 'input') {
            // code to show the toast
            appEvents.publish({
              type: AppEvents.alertWarning.name,
              payload: ['Please click the calendar icon to use the date picker to modify the date']
            });
          }
        }}
      >
        <DateTimePicker
          date={dateTime(value ? (value as string) : undefined)}
          onChange={(date) => onChange(date?.toISOString())}
          minDate={config.min ? new Date(config.min) : undefined}
          maxDate={config.max ? new Date(config.max) : undefined}
          {...TEST_IDS.editableCell.fieldDatetime.apply()}
        />
      </div>
    )},
    getControlOptions: ({ config }) => ({
      ...config,
      manualInputIsEnabled: config.manualInputIsEnabled ?? false,
    }),
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
  createEditableColumnEditorRegistryItem({
    id: ColumnEditorType.FILE,
    editor: ({ value, onChange }) => (
      <InlineFieldRow>
        <InlineField label="Allowed MIME Types" tooltip="Comma-separated list of allowed MIME types">
          <Input
            value={(value as EditorFileOptions)?.mimeType?.join(', ') || ''}
            onChange={(event) => {
              const mimeType = event.currentTarget.value.split(',').map((s) => s.trim());
              onChange(cleanPayloadObject({ ...value, mimeType }));
            }}
            placeholder="e.g., image/jpeg, application/pdf"
          />
        </InlineField>
        <InlineField label="Max File Size (MB)">
          <Input
            type="number"
            value={(value as EditorFileOptions)?.maxSize || ''}
            onChange={(event) => {
              const maxSize = Number(event.currentTarget.value);
              onChange(cleanPayloadObject({ ...value, maxSize }));
            }}
            placeholder="Maximum size in megabytes"
          />
        </InlineField>
        <InlineField label="Max Files">
          <Input
            type="number"
            value={(value as EditorFileOptions)?.limit || ''}
            onChange={(event) => {
              const limit = Number(event.currentTarget.value);
              onChange(cleanPayloadObject({ ...value, limit }));
            }}
            placeholder="Maximum number of files"
          />
        </InlineField>
      </InlineFieldRow>
    ),
    // Use a proper component name so we can call React hooks inside without lint errors
    control: function FileControl({ value, onChange, config, isSaving }) {
      const [error, setError] = React.useState<string | null>(null);

      const parsedValue = React.useMemo(() => {
        try {
          // Decode the URI-encoded JSON string if it's a string
          const decodedValue = typeof value === 'string' ? decodeURIComponent(value) : value;

          // Parse the JSON string into an array of file objects
          const parsedFiles = typeof decodedValue === 'string' ? JSON.parse(decodedValue) : decodedValue;

          // Ensure the parsed value is an array
          return Array.isArray(parsedFiles) ? parsedFiles : [];
        } catch (err) {
          console.error('Error parsing file data:', err);
          return [];
        }
      }, [value]);

      // Called when files are dropped/selected
      const handleDrop = (files: File[]) => {
        setError(null);

        // Check file count first
        if (config.limit && files.length > config.limit) {
          setError(`Maximum ${config.limit} file(s) allowed`);
          return;
        }

        // Validate file type & size
        for (const file of files) {
          if (config.mimeType?.length && !config.mimeType.includes(file.type)) {
            setError(`Invalid file type: ${file.type}`);
            return;
          }
          if (config.maxSize && file.size > config.maxSize * 1024 * 1024) {
            setError(`File too large: ${file.name} (max ${config.maxSize}MB)`);
            return;
          }
        }

        // Convert each file to base64 asynchronously
        const promises = files.map(
          (file) =>
            new Promise<{
              content: string | ArrayBuffer | null;
              type: string;
              name: string;
              size: number;
            }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  content: reader.result,
                  type: file.type,
                  name: file.name,
                  size: file.size,
                });
              };
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file); // Reads file as base64 data URL
            })
        );

        Promise.all(promises)
          .then((fileInfos) => {
            // Pass array of { content, type, name, size } to onChange

            const sanitizedFiles = fileInfos.map(file => ({
              ...file,
              content: file.content
                ?.toString()
                .replace(/\\/g, '\\\\')  // Escape backslashes
                .replace(/"/g, '\\"')    // Escape double quotes
            }));
            onChange(encodeURIComponent(JSON.stringify(sanitizedFiles)));
            // onChange("See me")
          })
          .catch((err) => {
            setError(`Error adding file(s): ${err}`);
          });
      };


      // Called when a single file is removed
      const handleRemove = (removedItem: { file: File }) => {
        try {
          const currentFiles = Array.isArray(parsedValue) ? parsedValue : [];
          const newFiles = currentFiles.filter((f) => f.name !== removedItem.file.name);

          // Sanitize for JSON transmission while keeping data URI intact
          const sanitizedFiles = newFiles.map(file => ({
            ...file,
            content: file.content
              ?.toString()
              .replace(/\\/g, '\\\\')  // Escape backslashes
              .replace(/"/g, '\\"')    // Escape double quotes
          }));

          // Double-encode for safe JSON embedding
          onChange(encodeURIComponent(JSON.stringify(sanitizedFiles)));
        } catch (err) {
          setError(`Error removing file(s): ${err}`);
        }
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/*
            InlineField only allows one direct child.
            So we wrap the FileDropzone in InlineField, then show the error outside.
          */}
          <InlineField label="File Upload" disabled={isSaving} grow>
            <FileDropzone
              options={{
                accept: config.mimeType?.join(',') || undefined,
                multiple: !!config.limit && config.limit > 1,
                onDrop: handleDrop,
              }}
              onFileRemove={handleRemove}
              // This prop is for your testing or data ID usage
              data-testid={TEST_IDS.editableCell.fieldFile.selector()}
            />
          </InlineField>

          {error && (
            <div style={{ color: 'red', marginTop: '8px' }}>
              {error}
            </div>
          )}
        </div>
      );
    },
    getControlOptions: ({ config }) => ({
      type: ColumnEditorType.FILE,
      mimeType: config.mimeType ?? [],
      maxSize: config.maxSize ?? 100, // default to 100 MB
      limit: config.limit ?? 1,
    }),
  })


]);
