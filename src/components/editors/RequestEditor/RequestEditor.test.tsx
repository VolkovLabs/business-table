import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { createTableRequestConfig } from '@/utils';

import { RequestEditor } from './RequestEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof RequestEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  datasourceEditor: createSelector('data-testid datasource-editor'),
  datasourcePayloadEditor: createSelector('data-testid datasource-payload-editor'),
};

/**
 * Mock Datasource Editor
 */
jest.mock('@/components/editors/DatasourceEditor', () => ({
  DatasourceEditor: ({ onChange }: any) => (
    <input {...inTestIds.datasourceEditor.apply()} onChange={(event) => onChange(event.currentTarget.value)} />
  ),
}));

/**
 * Mock Datasource Payload Editor
 */
jest.mock('@/components/editors/DatasourcePayloadEditor', () => ({
  DatasourcePayloadEditor: ({ value, onChange }: any) => (
    <input {...inTestIds.datasourcePayloadEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

describe('RequestEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(inTestIds);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <RequestEditor value={createTableRequestConfig({})} onChange={onChange} {...props} />;
  };

  it('Should allow to change datasource', () => {
    render(
      getComponent({
        value: createTableRequestConfig({
          datasource: '',
        }),
      })
    );

    expect(selectors.datasourceEditor()).toBeInTheDocument();

    fireEvent.change(selectors.datasourceEditor(), { target: { value: 'postgres' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        datasource: 'postgres',
        payload: {},
      })
    );
  });

  it('Should allow to change datasource payload', () => {
    render(
      getComponent({
        value: createTableRequestConfig({
          datasource: 'postgres',
          payload: {},
        }),
      })
    );

    expect(selectors.datasourcePayloadEditor()).toBeInTheDocument();

    fireEvent.change(selectors.datasourcePayloadEditor(), { target: { value: '123' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        datasource: 'postgres',
        payload: {},
      })
    );
  });
});
