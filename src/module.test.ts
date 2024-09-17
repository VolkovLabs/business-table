import { PanelPlugin } from '@grafana/data';

import { plugin } from './module';

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
});
