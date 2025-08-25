import React from 'react';

const actual = jest.requireActual('@volkovlabs/components');

/**
 * Mock AutosizeCodeEditor
 */
const AutosizeCodeEditorMock = ({ value, onChange, ...restProps }: any) => {
  return (
    <input
      aria-label={restProps['aria-label']}
      data-testid={restProps['data-testid']}
      value={value}
      onChange={(event) => {
        onChange(event.currentTarget.value);
      }}
    />
  );
};

const AutosizeCodeEditor = jest.fn(AutosizeCodeEditorMock);

/**
 * Mock Slider
 */
const SliderMock = ({ onChange, value, onAfterChange, ...restProps }: any) => {
  return (
    <input
      type="range"
      onChange={(event) => {
        if (onChange) {
          onChange(Number(event.target.value));
        }
      }}
      onBlur={(event) => {
        if (onAfterChange) {
          onAfterChange(Number(event.target.value));
        }
      }}
      data-testid={restProps['data-testid']}
      value={value}
    />
  );
};

const Slider = jest.fn(SliderMock);

beforeEach(() => {
  AutosizeCodeEditor.mockImplementation(AutosizeCodeEditorMock);
  Slider.mockImplementation(SliderMock);
});

/**
 * Mock useDatasourceRequest hook
 */
const useDatasourceRequest = jest.fn();

/**
 * Mock useDashboardRefresh hook
 */
const useDashboardRefresh = jest.fn();

module.exports = {
  ...actual,
  AutosizeCodeEditor,
  Slider,
  useDatasourceRequest,
  useDashboardRefresh,
};
