import React from 'react';

const actual = jest.requireActual('@volkovlabs/components');

/**
 * Mock AutosizeCodeEditor
 */
const AutosizeCodeEditorMock = ({ value, onChange, ...restProps }: any) => {
  return (
    <input
      aria-label={restProps['aria-label']}
      value={value}
      onChange={(event) => {
        onChange(event.currentTarget.value);
      }}
    />
  );
};

const AutosizeCodeEditor = jest.fn(AutosizeCodeEditorMock);

beforeEach(() => {
  AutosizeCodeEditor.mockImplementation(AutosizeCodeEditorMock);
});

/**
 * Mock useDatasourceRequest hook
 */
// const useDatasourceRequest = jest.fn();

module.exports = {
  ...actual,
  AutosizeCodeEditor,
  // useDatasourceRequest,
};
