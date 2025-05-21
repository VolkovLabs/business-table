import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { createExternalExportConfig } from '@/utils';

import { editorTestIds, ExternalExportEditor } from './ExternalExportEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof ExternalExportEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  requestEditor: createSelector('data-testid request-editor'),
};

/**
 * Mock Request Editor
 */
jest.mock('@/components/editors/RequestEditor', () => ({
  RequestEditor: ({ onChange, value }: any) => (
    <input {...inTestIds.requestEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

describe('AddDataEditor', () => {
  /**
   * Defaults
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...editorTestIds, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <ExternalExportEditor value={[]} onChange={onChange} context={{ data: [] }} item={{}} {...(props as any)} />;
  };

  it('Should allow to change enable', () => {
    render(
      getComponent({
        value: createExternalExportConfig({}),
      })
    );

    expect(selectors.fieldEnabled()).toBeInTheDocument();
    fireEvent.click(selectors.fieldEnabled());

    expect(onChange).toHaveBeenCalledWith(createExternalExportConfig({ enabled: true }));
  });

  it('Should allow to change enable if not specified', () => {
    render(
      getComponent({
        value: createExternalExportConfig({ enabled: undefined }),
      })
    );

    expect(selectors.fieldEnabled()).toBeInTheDocument();
    fireEvent.click(selectors.fieldEnabled());

    expect(onChange).toHaveBeenCalledWith(createExternalExportConfig({ enabled: true }));
  });

  it('Should allow to expand item', () => {
    render(
      getComponent({
        value: createExternalExportConfig({ enabled: true }),
      })
    );

    expect(selectors.requestSectionHeader()).toBeInTheDocument();
    expect(selectors.requestSectionContent(true)).not.toBeInTheDocument();

    fireEvent.click(selectors.requestSectionHeader());

    expect(selectors.requestSectionContent()).toBeInTheDocument();
  });

  it('Should allow to change request', () => {
    render(
      getComponent({
        value: createExternalExportConfig({ enabled: true }),
      })
    );

    expect(selectors.requestSectionHeader()).toBeInTheDocument();
    expect(selectors.requestSectionContent(true)).not.toBeInTheDocument();

    fireEvent.click(selectors.requestSectionHeader());

    expect(selectors.requestSectionContent()).toBeInTheDocument();
    expect(selectors.requestEditor()).toBeInTheDocument();

    fireEvent.change(selectors.requestEditor(), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith({ enabled: true, request: { datasource: '', payload: {} } });
  });

  it('Should allow to change request if not specified', () => {
    render(
      getComponent({
        value: createExternalExportConfig({ enabled: true, request: undefined }),
      })
    );

    expect(selectors.requestSectionHeader()).toBeInTheDocument();
    expect(selectors.requestSectionContent(true)).not.toBeInTheDocument();

    fireEvent.click(selectors.requestSectionHeader());

    expect(selectors.requestSectionContent()).toBeInTheDocument();
    expect(selectors.requestEditor()).toBeInTheDocument();

    fireEvent.change(selectors.requestEditor(), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith({ enabled: true, request: { datasource: '', payload: {} } });
  });
});
