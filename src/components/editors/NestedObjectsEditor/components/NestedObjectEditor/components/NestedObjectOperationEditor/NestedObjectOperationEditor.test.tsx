import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { PermissionMode } from '@/types';
import { createNestedObjectOperationConfig, createPermissionConfig, createTableRequestConfig } from '@/utils';

import { NestedObjectOperationEditor } from './NestedObjectOperationEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof NestedObjectOperationEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  requestEditor: createSelector('data-testid request-editor'),
  permissionEditor: createSelector('data-testid permission-editor'),
};

/**
 * Mock Request Editor
 */
jest.mock('@/components/editors/RequestEditor', () => ({
  RequestEditor: ({ onChange, value }: any) => (
    <input {...inTestIds.requestEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

/**
 * Mock Permission Editor
 */
jest.mock('@/components/editors/PermissionEditor', () => ({
  PermissionEditor: ({ onChange, value }: any) => (
    <input {...inTestIds.permissionEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

describe('NestedObjectOperationEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.nestedObjectOperationEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <NestedObjectOperationEditor value={createNestedObjectOperationConfig({})} onChange={onChange} {...props} />;
  };

  it('Should allow to change request', () => {
    render(
      getComponent({
        value: createNestedObjectOperationConfig({
          request: createTableRequestConfig({
            datasource: 'abc',
          }),
        }),
      })
    );

    expect(selectors.requestSectionHeader()).toBeInTheDocument();
    fireEvent.click(selectors.requestSectionHeader());

    expect(selectors.requestSectionContent()).toBeInTheDocument();
    expect(selectors.requestEditor()).toBeInTheDocument();

    fireEvent.change(selectors.requestEditor(), { target: { value: '123' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        request: createTableRequestConfig({
          datasource: 'abc',
        }),
      })
    );
  });

  it('Should allow to update permission', () => {
    render(
      getComponent({
        value: createNestedObjectOperationConfig({
          permission: createPermissionConfig({
            mode: PermissionMode.QUERY,
          }),
        }),
      })
    );

    expect(selectors.permissionEditor()).toBeInTheDocument();

    fireEvent.change(selectors.permissionEditor(), { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        permission: createPermissionConfig({
          mode: PermissionMode.QUERY,
        }),
      })
    );
  });
});
