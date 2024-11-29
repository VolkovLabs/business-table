import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { PermissionMode } from '@/types';
import {
  createColumnConfig,
  createColumnNewRowEditConfig,
  createPermissionConfig,
  createTableConfig,
  createTableOperationConfig,
  createTableRequestConfig,
} from '@/utils';

import { TableDeleteRowEditor, testIds } from './TableDeleteRowEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TableDeleteRowEditor>;

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

describe('TableDeleteRowEditor', () => {
  /**
   * Defaults
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...testIds, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TableDeleteRowEditor onChange={onChange} data={[]} {...(props as any)} />;
  };

  describe('Request', () => {
    const openSection = () => {
      expect(selectors.requestSectionHeader()).toBeInTheDocument();

      fireEvent.click(selectors.requestSectionHeader());

      expect(selectors.requestSectionContent()).toBeInTheDocument();
    };

    it('Should allow to change request', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                newRowEdit: createColumnNewRowEditConfig({
                  enabled: true,
                }),
              }),
            ],
            update: createTableRequestConfig({
              datasource: 'postgres',
            }),
          }),
        })
      );

      openSection();

      expect(selectors.requestEditor()).toBeInTheDocument();

      fireEvent.change(selectors.requestEditor(), { target: { value: '123' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          update: createTableRequestConfig({
            datasource: 'postgres',
          }),
        })
      );
    });
  });

  it('Should allow to update permission', () => {
    render(
      getComponent({
        value: createTableConfig({
          deleteRow: createTableOperationConfig({
            enabled: true,
            permission: createPermissionConfig({
              mode: PermissionMode.QUERY,
            }),
          }),
          items: [],
        }),
      })
    );

    expect(selectors.permissionEditor()).toBeInTheDocument();

    fireEvent.change(selectors.permissionEditor(), { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        deleteRow: expect.objectContaining({
          permission: createPermissionConfig({
            mode: PermissionMode.QUERY,
          }),
        }),
      })
    );
  });
});
