import { AppEvents, dateTime, dateTimeFormat } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import {
  DateTimePicker,
  FileDropzone,
  InlineField,
  InlineFieldRow,
  InlineSwitch,
  Input,
  MultiCombobox,
  Select,
  TextArea,
} from '@grafana/ui';
import { FileRejection } from 'react-dropzone/.';

import { NumberInput } from '@volkovlabs/components';
import React, { ChangeEvent } from 'react';

import { COMMON_FILE_EXTENSIONS, TEST_IDS } from '@/constants';
import { ColumnEditorType, EditorFileOptions } from '@/types';
import {
  applyAcceptedFiles,
  cleanPayloadObject,
  createEditableColumnEditorRegistryItem,
  createEditableColumnEditorsRegistry,
  formatNumberValue,
  toBase64,
} from '@/utils';

import { DateEditor, QueryOptionsEditor } from './components';
import { FileListItem } from '@/dev_additions/GrafanaUI/src/components/FileDropzone/FileListItem';

/**
 * Editable Column Editors Registry
 */
const appEvents = getAppEvents();
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
        <InlineField label="Max" grow={true}>
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
    id: ColumnEditorType.DATE,
    editor: ({ value, onChange }) => (
      <>
        <InlineField label="Use local time" grow={true}>
          <InlineSwitch
            value={value.isUseLocalTime}
            onChange={(event) =>
              onChange(
                cleanPayloadObject({
                  ...value,
                  isUseLocalTime: event.currentTarget.checked,
                })
              )
            }
            {...TEST_IDS.editableColumnEditor.fieldLocalTime.apply()}
          />
        </InlineField>
      </>
    ),
    control: ({ value, onChange, config }) => (
      <DateTimePicker
        date={dateTime(value ? (value as string) : undefined)}
        onChange={(date) => {
          if (date) {
            const currentValue: string = dateTimeFormat(date?.toISOString(), {
              timeZone: config.isUseLocalTime ? '' : 'utc',
              format: 'YYYY-MM-DD',
            });
            onChange(currentValue);
          }
        }}
        showSeconds={false}
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
  createEditableColumnEditorRegistryItem({
    id: ColumnEditorType.FILE,
    editor: ({ value, onChange }) => (
      <InlineFieldRow>
        <InlineField label="Allowed File Extensions" tooltip="Comma-separated list of allowed file extensions and MIME types">
          <MultiCombobox
            minWidth={50}
            value={((value as EditorFileOptions)?.fileExtensions || []).map(item => {
              const knownType = COMMON_FILE_EXTENSIONS.find(opt => opt.value === item);
              return knownType || { value: item, label: item };
            })}
            onChange={(options) => {
              const fileExtensions = options.map(option => option.label);
              const mimeType: string[] = options.map(option => option.value) as any;
              onChange(cleanPayloadObject({ ...value, fileExtensions, mimeType }));
            }}
            options={COMMON_FILE_EXTENSIONS}
            createCustomValue={true}
            enableAllOption={true}
            placeholder="e.g., jpg, pdf"
            width="auto"
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
    control: function FileControl({ value, onChange, config }) {
      const [error, setError] = React.useState<string | null>(null);

      const parsedValue = React.useMemo(() => {
        try {
          // Decode the URI-encoded JSON string if it's a string
          const decodedValue = typeof value === 'string' ? decodeURIComponent(value) : value;

          // Parse the JSON string into an array of file objects
          const parsedFiles = typeof decodedValue === 'string' ? JSON.parse(decodedValue) : decodedValue;

          // Ensure the parsed value is an array
          return Array.isArray(parsedFiles) ? parsedFiles : [];
        } catch {
          // const appEvents = getAppEvents();
          // appEvents.publish({
          //   type: AppEvents.alertError.name,
          //   payload: ['An error occurred while parsing file data. Please try again later or contact support if the issue persists.',err],
          // })

          return [];
        }
      }, [value]);

      // Called when files are dropped/selected
      const handleDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[], event, removeFile) => {
        setError(null);

        let files = [...acceptedFiles]

        // Check file count first
        if (config.limit && acceptedFiles.length > config.limit) {
          appEvents.publish({
            type: AppEvents.alertError.name,
            payload: [`Maximum ${config.limit} file(s) allowed`]
          });
          return;
        }

        // Validate file type & size
        for (const file of files) {
          if (config.fileExtensions?.length) {
            console.log(file)
            const allowedTypes = config.fileExtensions;
            const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

            // Check both MIME type and file extension
            const isValidType = allowedTypes.includes(file.type);
            const isValidExtension = allowedTypes.includes(fileExtension);

            if (!isValidType && !isValidExtension) {

              appEvents.publish({
                type: AppEvents.alertError.name,
                payload: [`Invalid file type: ${file.name}`]
              });
              removeFile(file)
              return;
            }
          }

          if (config.maxSize && file.size > config.maxSize * 1024 * 1024) {

            appEvents.publish({
              type: AppEvents.alertError.name,
              payload: [`File too large: ${file.name} (max ${config.maxSize}MB)`]
            });
            removeFile(file)
            return;
          }
        }

        // Convert each file to base64 asynchronously
        const promises = acceptedFiles.map(
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
            const sanitizedFiles = fileInfos.map(file => ({
              ...file,
              content: file.content
                ?.toString()
                .replace(/\\/g, '\\\\')  // Escape backslashes
                .replace(/"/g, '\\"')    // Escape double quotes
            }));
            onChange(encodeURIComponent(JSON.stringify(sanitizedFiles)));
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
          {/* <InlineField label="File Upload" disabled={isSaving} grow> */}
          <FileDropzone
            options={{
              acceptString: config.fileExtensions?.length > 0 ? "Allowed file extensions " + config.fileExtensions?.join(' , ') : undefined,
              accept: config.mimeType?.join(' , ') || undefined,
              multiple: !!config.limit && config.limit > 1,
              // @ts-ignore
              onDrop: handleDrop,
              maxSize: config.maxSize * 1000000
            }}
            fileListRenderer={(file, removeFile) => {
              return <FileListItem
                showFileIcon={false}
                name="File"
                fileNameWrapperStyle={{
                  display: 'flex',
                  flexFlow: 'row wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                }}
                file={file} removeFile={removeFile} />;
            }}
            onFileRemove={handleRemove}
            // This prop is for your testing or data ID usage
            data-testid={TEST_IDS.editableCell.fieldFile.selector()}
          />
          {/* </InlineField> */}

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
      fileExtensions: config.fileExtensions ?? [],
      mimeType: config.mimeType ?? [],
      maxSize: config.maxSize ?? 100, // default to 100 MB
      limit: config.limit ?? 1,
    }),
  })  
  // createEditableColumnEditorRegistryItem({
  //   id: ColumnEditorType.FILE,
  //   editor: ({ value, onChange }) => (
  //     <InlineFieldRow>
  //       <InlineField
  //         label="Accept"
  //         tooltip="Specify comma-separated file extensions or keep blank to allow any file"
  //         grow={true}
  //       >
  //         <Input
  //           value={value?.accept}
  //           onChange={(event) => {
  //             const accept = event.currentTarget.value;
  //             onChange(cleanPayloadObject({ ...value, accept }));
  //           }}
  //           placeholder="e.g., image/jpeg, application/pdf"
  //           {...TEST_IDS.editableColumnEditor.fieldFileAcceptTypes.apply()}
  //         />
  //       </InlineField>
  //     </InlineFieldRow>
  //   ),
  //   control: ({ onChange, config, isSaving }) => (
  //     <InlineField label="File Upload" disabled={isSaving} grow={true}>
  //       <FileDropzone
  //         options={{
  //           accept: applyAcceptedFiles(config.accept),
  //           multiple: false,
  //           onDrop: (files: File[]) => {
  //             /**
  //              * base64 result return
  //              */
  //             toBase64(files[0]).then((result) => {
  //               onChange(result);
  //             });
  //           },
  //         }}
  //         {...TEST_IDS.editableCell.fieldFile.apply()}
  //       />
  //     </InlineField>
  //   ),
  //   getControlOptions: ({ config }) => ({
  //     type: ColumnEditorType.FILE,
  //     accept: config.accept ?? '',
  //   }),
  // }),
]);
