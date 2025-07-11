import { PanelPlugin } from '@grafana/data';

import { PanelOptions } from '@/types';

import { plugin } from './module';
import { createTableConfig } from './utils';

/*
 Plugin
 */
describe('plugin', () => {
  /**
   * Builder
   */
  const builder: any = {
    addColorPicker: jest.fn(),
    addCustomEditor: jest.fn(),
    addRadio: jest.fn(),
    addSelect: jest.fn(),
    addSliderInput: jest.fn(),
    addTextInput: jest.fn(),
    addMultiSelect: jest.fn(),
    addBooleanSwitch: jest.fn(),
  };

  const addFieldMock = () => builder;

  beforeEach(() => {
    builder.addColorPicker.mockImplementation(addFieldMock);
    builder.addCustomEditor.mockImplementation(addFieldMock);
    builder.addRadio.mockImplementation(addFieldMock);
    builder.addSelect.mockImplementation(addFieldMock);
    builder.addSliderInput.mockImplementation(addFieldMock);
    builder.addTextInput.mockImplementation(addFieldMock);
    builder.addMultiSelect.mockImplementation(addFieldMock);
    builder.addBooleanSwitch.mockImplementation(addFieldMock);
  });

  it('Should be instance of PanelPlugin', () => {
    expect(plugin).toBeInstanceOf(PanelPlugin);
  });

  it('Should add editors', () => {
    /**
     * Supplier
     */
    plugin['optionsSupplier'](builder);

    /**
     * Inputs
     */
    expect(builder.addCustomEditor).toHaveBeenCalled();
  });

  describe('Visibility', () => {
    /**
     * Add Input Implementation
     * @param config
     * @param result
     */
    const addInputImplementation = (config: Partial<PanelOptions>, result: string[]) => (input: any) => {
      if (input.showIf) {
        if (input.showIf(config)) {
          result.push(input.path);
        }
      } else {
        result.push(input.path);
      }
      return builder;
    };

    it('Should show pagination editor', () => {
      const shownOptionsPaths: string[] = [];

      builder.addCustomEditor.mockImplementation(
        addInputImplementation(
          {
            tables: [createTableConfig({ name: 'group1', items: [] })],
          },
          shownOptionsPaths
        )
      );

      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['tables', 'tables', 'tables', 'nestedObjects']));
    });

    it('Should show alignment options', () => {
      const shownOptionsPaths: string[] = [];

      builder.addRadio.mockImplementation(
        addInputImplementation(
          {
            toolbar: {
              export: true,
              exportFormats: [],
            },
          },
          shownOptionsPaths
        )
      );

      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['toolbar.alignment']));
    });

    it('Should show tabsSorting options', () => {
      const shownOptionsPaths: string[] = [];

      builder.addBooleanSwitch.mockImplementation(
        addInputImplementation(
          {
            tables: [
              createTableConfig({ name: 'group1', items: [] }),
              createTableConfig({ name: 'group2', items: [] }),
            ],
          },
          shownOptionsPaths
        )
      );

      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['tabsSorting']));
    });

    it('Should show columnManagerNativeIcon when column manager is available and custom icon is disabled', () => {
      const shownOptionsPaths: string[] = [];

      builder.addSelect.mockImplementation(
        addInputImplementation(
          {
            isColumnManagerAvailable: true,
            isColumnManagerShowCustomIcon: false,
          },
          shownOptionsPaths
        )
      );

      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['columnManagerNativeIcon']));
    });

    it('Should show columnManagerCustomIcon when column manager is available and custom icon is enabled', () => {
      const shownOptionsPaths: string[] = [];

      builder.addTextInput.mockImplementation(
        addInputImplementation(
          {
            isColumnManagerAvailable: true,
            isColumnManagerShowCustomIcon: true,
          },
          shownOptionsPaths
        )
      );

      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['columnManagerCustomIcon']));
    });
  });
});
