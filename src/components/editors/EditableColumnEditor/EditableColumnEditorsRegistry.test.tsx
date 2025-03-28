import { DataFrame, PanelData, toDataFrame } from '@grafana/data';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnEditorConfig, ColumnEditorType } from '@/types';
import { createColumnEditConfig, toBase64 } from '@/utils';

import { editableColumnEditorsRegistry } from './EditableColumnEditorsRegistry';

describe('editableColumnEditorsRegistry', () => {
  /**
   * Editor Selectors
   */
  const getEditorSelectors = getJestSelectors(TEST_IDS.editableColumnEditor);
  const editorSelectors = getEditorSelectors(screen);

  /**
   * Control Selectors
   */
  const getControlSelectors = getJestSelectors(TEST_IDS.editableCell);
  const controlSelectors = getControlSelectors(screen);

  /**
   * Change
   */
  const onChangeConfig = jest.fn();
  const onChange = jest.fn();

  /**
   * Get Editor Component
   */
  const getEditorComponent = (props: { value: ColumnEditorConfig; onChange?: () => void; data?: DataFrame[] }) => {
    const Editor = editableColumnEditorsRegistry.get(props.value.type)?.editor;

    if (!Editor) {
      return null;
    }

    return <Editor onChange={onChangeConfig} {...(props as any)} />;
  };

  /**
   * Get Control Component
   */
  const getControlComponent = ({
    value,
    config,
    data,
    isSaving = false,
  }: {
    value: unknown;
    config: ColumnEditorConfig;
    onChange?: () => void;
    data?: PanelData;
    isSaving?: boolean;
  }) => {
    const item = editableColumnEditorsRegistry.get(config.type);
    const Control = item?.control;

    if (!item || !Control) {
      return null;
    }

    return (
      <Control
        onChange={onChange}
        value={value}
        config={item.getControlOptions({ config, data } as any) as never}
        isSaving={isSaving}
      />
    );
  };

  describe('String', () => {
    it('Should render editor', () => {
      render(
        getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.STRING } }).editor })
      );

      /**
       * String doesn't have editor yet
       */
      expect(true).toBeTruthy();
    });

    it('Should render control', () => {
      render(
        getControlComponent({
          value: 'abc',
          config: createColumnEditConfig({ editor: { type: ColumnEditorType.STRING } }).editor,
        })
      );

      expect(controlSelectors.fieldString()).toBeInTheDocument();
      expect(controlSelectors.fieldString()).toHaveValue('abc');

      fireEvent.change(controlSelectors.fieldString(), { target: { value: 'hello' } });

      expect(onChange).toHaveBeenCalledWith('hello');
    });
  });

  describe('Number', () => {
    it('Should render editor', () => {
      render(
        getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.NUMBER } }).editor })
      );

      expect(editorSelectors.fieldNumberMin()).toBeInTheDocument();
      expect(editorSelectors.fieldNumberMax()).toBeInTheDocument();
    });

    it('Should allow to set min in config', () => {
      render(
        getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.NUMBER } }).editor })
      );

      expect(editorSelectors.fieldNumberMin()).toBeInTheDocument();
      expect(editorSelectors.fieldNumberMin()).toHaveValue(null);

      fireEvent.change(editorSelectors.fieldNumberMin(), { target: { value: '10' } });

      expect(onChangeConfig).toHaveBeenCalledWith({
        min: 10,
        type: ColumnEditorType.NUMBER,
      });
    });

    it('Should allow to reset min in config', () => {
      render(
        getEditorComponent({
          value: createColumnEditConfig({ editor: { type: ColumnEditorType.NUMBER, min: 10 } }).editor,
        })
      );

      expect(editorSelectors.fieldNumberMin()).toBeInTheDocument();
      expect(editorSelectors.fieldNumberMin()).toHaveValue(10);

      fireEvent.change(editorSelectors.fieldNumberMin(), { target: { value: '' } });

      expect(onChangeConfig).toHaveBeenCalledWith({
        type: ColumnEditorType.NUMBER,
      });
    });

    it('Should allow to set max in config', () => {
      render(
        getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.NUMBER } }).editor })
      );

      expect(editorSelectors.fieldNumberMax()).toBeInTheDocument();
      expect(editorSelectors.fieldNumberMax()).toHaveValue(null);

      fireEvent.change(editorSelectors.fieldNumberMax(), { target: { value: '10' } });

      expect(onChangeConfig).toHaveBeenCalledWith({
        max: 10,
        type: ColumnEditorType.NUMBER,
      });
    });

    it('Should allow to reset max in config', () => {
      render(
        getEditorComponent({
          value: createColumnEditConfig({ editor: { type: ColumnEditorType.NUMBER, max: 10 } }).editor,
        })
      );

      expect(editorSelectors.fieldNumberMax()).toBeInTheDocument();
      expect(editorSelectors.fieldNumberMax()).toHaveValue(10);

      fireEvent.change(editorSelectors.fieldNumberMax(), { target: { value: '' } });

      expect(onChangeConfig).toHaveBeenCalledWith({
        type: ColumnEditorType.NUMBER,
      });
    });

    it('Should render control', () => {
      render(
        getControlComponent({
          value: 123,
          config: createColumnEditConfig({ editor: { type: ColumnEditorType.NUMBER } }).editor,
        })
      );

      expect(controlSelectors.fieldNumber()).toBeInTheDocument();
      expect(controlSelectors.fieldNumber()).toHaveValue('123');

      fireEvent.change(controlSelectors.fieldNumber(), { target: { value: 100 } });
      fireEvent.blur(controlSelectors.fieldNumber(), { target: { value: 100 } });

      expect(onChange).toHaveBeenCalledWith(100);
    });
  });

  describe('Datetime', () => {
    it('Should render editor', () => {
      render(
        getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.DATETIME } }).editor })
      );

      expect(editorSelectors.fieldDatetimeMin()).toBeInTheDocument();
      expect(editorSelectors.fieldDatetimeMin()).toBeInTheDocument();
    });

    it('Should allow to set min in config', () => {
      render(
        getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.DATETIME } }).editor })
      );

      expect(editorSelectors.fieldDatetimeMin()).toBeInTheDocument();

      const fieldSelectors = getJestSelectors(TEST_IDS.dateEditor)(within(editorSelectors.fieldDatetimeMin()));

      expect(fieldSelectors.buttonSetDate()).toBeInTheDocument();

      fireEvent.click(fieldSelectors.buttonSetDate());

      expect(onChangeConfig).toHaveBeenCalledWith({
        type: ColumnEditorType.DATETIME,
        min: expect.any(String),
      });
    });

    it('Should allow to reset min in config', () => {
      render(
        getEditorComponent({
          value: createColumnEditConfig({ editor: { type: ColumnEditorType.DATETIME, min: new Date().toISOString() } })
            .editor,
        })
      );

      expect(editorSelectors.fieldDatetimeMin()).toBeInTheDocument();

      const fieldSelectors = getJestSelectors(TEST_IDS.dateEditor)(within(editorSelectors.fieldDatetimeMin()));

      expect(fieldSelectors.buttonRemoveDate()).toBeInTheDocument();

      fireEvent.click(fieldSelectors.buttonRemoveDate());

      expect(onChangeConfig).toHaveBeenCalledWith({
        type: ColumnEditorType.DATETIME,
      });
    });

    it('Should allow to set max in config', () => {
      render(
        getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.DATETIME } }).editor })
      );

      expect(editorSelectors.fieldDatetimeMax()).toBeInTheDocument();

      const fieldSelectors = getJestSelectors(TEST_IDS.dateEditor)(within(editorSelectors.fieldDatetimeMax()));

      expect(fieldSelectors.buttonSetDate()).toBeInTheDocument();

      fireEvent.click(fieldSelectors.buttonSetDate());

      expect(onChangeConfig).toHaveBeenCalledWith({
        type: ColumnEditorType.DATETIME,
        max: expect.any(String),
      });
    });

    it('Should allow to reset max in config', () => {
      render(
        getEditorComponent({
          value: createColumnEditConfig({ editor: { type: ColumnEditorType.DATETIME, max: new Date().toISOString() } })
            .editor,
        })
      );

      expect(editorSelectors.fieldDatetimeMax()).toBeInTheDocument();

      const fieldSelectors = getJestSelectors(TEST_IDS.dateEditor)(within(editorSelectors.fieldDatetimeMax()));

      expect(fieldSelectors.buttonRemoveDate()).toBeInTheDocument();

      fireEvent.click(fieldSelectors.buttonRemoveDate());

      expect(onChangeConfig).toHaveBeenCalledWith({
        type: ColumnEditorType.DATETIME,
      });
    });

    it('Should render control', () => {
      render(
        getControlComponent({
          value: new Date().toISOString(),
          config: createColumnEditConfig({ editor: { type: ColumnEditorType.DATETIME } }).editor,
        })
      );

      expect(controlSelectors.fieldDatetime()).toBeInTheDocument();

      const newDateString = new Date().toISOString();
      fireEvent.change(controlSelectors.fieldDatetime(), { target: { value: newDateString } });

      expect(onChange).toHaveBeenCalledWith(newDateString);
    });

    it('Should render control with min and max dates', () => {
      render(
        getControlComponent({
          value: new Date().toISOString(),
          config: createColumnEditConfig({
            editor: { type: ColumnEditorType.DATETIME, min: new Date().toISOString(), max: new Date().toISOString() },
          }).editor,
        })
      );

      expect(controlSelectors.fieldDatetime()).toBeInTheDocument();
    });
  });

  describe('Select', () => {
    it('Should render editor', () => {
      render(
        getEditorComponent({
          value: createColumnEditConfig({ editor: { type: ColumnEditorType.SELECT } }).editor,
          data: [toDataFrame({ refId: 'A', fields: [{ name: 'value', values: [] }] })],
        })
      );

      const editor = getJestSelectors(TEST_IDS.queryOptionsEditor)(screen).fieldValue();
      expect(editor).toBeInTheDocument();

      fireEvent.change(editor, { target: { value: 'A:value' } });

      expect(onChangeConfig).toHaveBeenCalledWith({
        type: ColumnEditorType.SELECT,
        queryOptions: {
          label: null,
          source: 'A',
          value: 'value',
        },
      });
    });

    it('Should allow to set customValues option', () => {
      render(
        getEditorComponent({
          value: createColumnEditConfig({ editor: { type: ColumnEditorType.SELECT } }).editor,
          data: [toDataFrame({ refId: 'A', fields: [{ name: 'value', values: [] }] })],
        })
      );

      expect(editorSelectors.fieldCustomValues()).toBeInTheDocument();
      expect(editorSelectors.fieldCustomValues()).not.toBeChecked();

      fireEvent.click(editorSelectors.fieldCustomValues());

      expect(onChangeConfig).toHaveBeenCalledWith({
        type: ColumnEditorType.SELECT,
        customValues: true,
      });
    });

    it('Should render control', () => {
      render(
        getControlComponent({
          value: 'active',
          config: createColumnEditConfig({
            editor: {
              type: ColumnEditorType.SELECT,
              queryOptions: {
                source: 'A',
                value: 'value',
                label: null,
              },
            },
          }).editor,
          data: {
            series: [
              toDataFrame({
                refId: 'A',
                fields: [{ name: 'value', values: ['active', 'pending'] }],
              }),
            ],
          } as any,
        })
      );

      expect(controlSelectors.fieldSelect()).toBeInTheDocument();
      expect(controlSelectors.fieldSelect()).toHaveValue('active');

      fireEvent.change(controlSelectors.fieldSelect(), { target: { value: 'pending' } });

      expect(onChange).toHaveBeenCalledWith('pending');
    });

    describe('getControlOptions', () => {
      const getControlOptionsDefault = () => false;
      const getControlOptions =
        editableColumnEditorsRegistry.get(ColumnEditorType.SELECT)?.getControlOptions || getControlOptionsDefault;

      /**
       * Panel Data
       */
      const data = {
        series: [
          toDataFrame({
            refId: 'A',
            fields: [
              { name: 'value', values: ['active', 'pending'] },
              { name: 'label', values: ['Active', 'Pending'] },
            ],
          }),
        ],
      } as never;

      it('Should work if no query options', () => {
        expect(
          getControlOptions({
            config: createColumnEditConfig({ editor: { type: ColumnEditorType.SELECT } }).editor as never,
            data,
          })
        ).toEqual({
          type: ColumnEditorType.SELECT,
          customValues: false,
          options: [],
        });
      });

      it('Should work if value field not found', () => {
        expect(
          getControlOptions({
            config: createColumnEditConfig({
              editor: {
                type: ColumnEditorType.SELECT,
                queryOptions: {
                  source: 'abc',
                  value: '123',
                  label: '',
                },
              },
            }).editor as never,
            data,
          })
        ).toEqual({
          type: ColumnEditorType.SELECT,
          customValues: false,
          options: [],
        });
      });

      it('Should work with customValues', () => {
        expect(
          getControlOptions({
            config: createColumnEditConfig({
              editor: {
                type: ColumnEditorType.SELECT,
                customValues: true,
                queryOptions: {
                  source: 'abc',
                  value: '123',
                  label: '',
                },
              },
            }).editor as never,
            data,
          })
        ).toEqual({
          type: ColumnEditorType.SELECT,
          customValues: true,
          options: [],
        });
      });

      it('Should return values and labels from panel data', () => {
        expect(
          getControlOptions({
            config: createColumnEditConfig({
              editor: {
                type: ColumnEditorType.SELECT,
                queryOptions: {
                  source: 'A',
                  value: 'value',
                  label: 'label',
                },
              },
            }).editor as never,
            data,
          })
        ).toEqual({
          type: ColumnEditorType.SELECT,
          customValues: false,
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Pending', value: 'pending' },
          ],
        });
      });
    });
  });

  describe('Text Area', () => {
    it('Should render editor', () => {
      render(
        getEditorComponent({
          value: createColumnEditConfig({ editor: { type: ColumnEditorType.TEXTAREA } }).editor,
        })
      );

      /**
       * String doesn't have editor yet
       */
      expect(true).toBeTruthy();
    });

    it('Should render control', () => {
      render(
        getControlComponent({
          value: 'line',
          config: createColumnEditConfig({ editor: { type: ColumnEditorType.TEXTAREA } }).editor,
        })
      );

      expect(controlSelectors.fieldTextarea()).toBeInTheDocument();
      expect(controlSelectors.fieldTextarea()).toHaveValue('line');

      fireEvent.change(controlSelectors.fieldTextarea(), { target: { value: 'line updated' } });

      expect(onChange).toHaveBeenCalledWith('line updated');
    });

    it('Should render control with a non-string type ', () => {
      render(
        getControlComponent({
          value: null,
          config: createColumnEditConfig({ editor: { type: ColumnEditorType.TEXTAREA } }).editor,
        })
      );

      expect(controlSelectors.fieldTextarea()).toBeInTheDocument();
      expect(controlSelectors.fieldTextarea()).toHaveValue('null');

      fireEvent.change(controlSelectors.fieldTextarea(), { target: { value: 'line updated' } });

      expect(onChange).toHaveBeenCalledWith('line updated');
    });

    it('Should render control with replaced lines and replace line onChange correctly', () => {
      render(
        getControlComponent({
          value: 'line\\nline-2',
          config: createColumnEditConfig({ editor: { type: ColumnEditorType.TEXTAREA } }).editor,
        })
      );

      expect(controlSelectors.fieldTextarea()).toBeInTheDocument();
      expect(controlSelectors.fieldTextarea()).toHaveValue('line\nline-2');

      fireEvent.change(controlSelectors.fieldTextarea(), { target: { value: 'line\nline-2\nline-3' } });

      expect(onChange).toHaveBeenCalledWith('line\\nline-2\\nline-3');
    });
  });

  describe('Boolean', () => {
    it('Should render editor', () => {
      render(
        getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.BOOLEAN } }).editor })
      );

      /**
       * Boolean doesn't have editor yet
       */
      expect(true).toBeTruthy();
    });

    it('Should render control', () => {
      render(
        getControlComponent({
          value: false,
          config: createColumnEditConfig({ editor: { type: ColumnEditorType.BOOLEAN } }).editor,
        })
      );

      expect(controlSelectors.fieldBoolean()).toBeInTheDocument();
      expect(controlSelectors.fieldBoolean()).not.toBeChecked();

      fireEvent.click(controlSelectors.fieldBoolean());

      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Date', () => {
    it('Should render editor', () => {
      render(getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.DATE } }).editor }));

      expect(editorSelectors.fieldLocalTime()).toBeInTheDocument();
    });

    it('Should allow change local time option', () => {
      render(getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.DATE } }).editor }));

      expect(editorSelectors.fieldLocalTime()).toBeInTheDocument();

      fireEvent.click(editorSelectors.fieldLocalTime());

      expect(onChangeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          isUseLocalTime: true,
        })
      );
    });

    it('Should render control and change date in format', () => {
      render(
        getControlComponent({
          value: new Date().toISOString(),
          config: createColumnEditConfig({ editor: { type: ColumnEditorType.DATE } }).editor,
        })
      );

      expect(controlSelectors.fieldDatetime()).toBeInTheDocument();

      const newDateString = new Date('2025-03-04').toISOString();
      fireEvent.change(controlSelectors.fieldDatetime(), { target: { value: newDateString } });

      expect(onChange).toHaveBeenCalledWith('2025-03-04');
    });
  });

  describe('File type', () => {
    it('Should render editor', () => {
      render(getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.FILE } }).editor }));
      expect(editorSelectors.fieldFileAcceptTypes()).toBeInTheDocument();
    });

    it('Should change accept files', () => {
      render(getEditorComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.FILE } }).editor }));
      expect(editorSelectors.fieldFileAcceptTypes()).toBeInTheDocument();

      fireEvent.change(editorSelectors.fieldFileAcceptTypes(), { target: { value: 'png' } });

      expect(onChangeConfig).toHaveBeenCalledWith({
        type: ColumnEditorType.FILE,
        accept: 'png',
      });
    });

    it('Should render control and add file', async () => {
      render(
        getControlComponent({
          value: '',
          config: createColumnEditConfig({ editor: { type: ColumnEditorType.FILE } }).editor,
        })
      );

      const image = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

      expect(controlSelectors.fieldFile()).toBeInTheDocument();

      await act(async () => {
        fireEvent.change(controlSelectors.fieldFile(), {
          target: { files: [image] },
        });
      });

      /**
       * onChange inside onDrop is async, need use waitFor
       */
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledTimes(1);
      });

      const expectedBase64 = await toBase64(image);
      expect(onChange).toHaveBeenCalledWith(expectedBase64);
    });
  });
});
