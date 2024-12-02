import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnEditorType, PermissionMode } from '@/types';
import {
  createColumnConfig,
  createColumnNewRowEditConfig,
  createPermissionConfig,
  createTableConfig,
  createTableOperationConfig,
  createTableRequestConfig,
} from '@/utils';

import { TableAddRowEditor, testIds } from './TableAddRowEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TableAddRowEditor>;

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

describe('TableAddRowEditor', () => {
  /**
   * Defaults
   */
  const onChange = jest.fn();
  const defaultField = { source: 'A', name: 'hello' };
  const defaultName = 'A:hello';

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...testIds, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TableAddRowEditor onChange={onChange} data={[]} {...(props as any)} />;
  };

  it('Should show message if no items', () => {
    render(getComponent({ value: createTableConfig({ items: [] }) }));

    expect(selectors.noColumnsMessage()).toBeInTheDocument();
  });

  it('Should show disabled header message if hidden header', () => {
    render(getComponent({ value: createTableConfig({ showHeader: false }) }));

    expect(selectors.disabledHeaderMessage()).toBeInTheDocument();
  });

  it('Should not show message if items present', () => {
    render(getComponent({ value: createTableConfig({ items: [createColumnConfig({})] }) }));

    expect(selectors.noColumnsMessage(true)).not.toBeInTheDocument();
  });

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

  describe('Edit Settings', () => {
    const openSettings = (name: string) => {
      expect(selectors.columnHeader(false, name)).toBeInTheDocument();

      fireEvent.click(selectors.columnHeader(false, name));

      expect(selectors.columnContent(false, name)).toBeInTheDocument();
    };

    it('Should allow to enable edit in header', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                field: defaultField,
                newRowEdit: createColumnNewRowEditConfig({
                  enabled: false,
                }),
              }),
              createColumnConfig({
                field: { source: 'B', name: '123' },
              }),
            ],
          }),
        })
      );

      expect(selectors.fieldEditQuickEnabled(false, defaultName)).toBeInTheDocument();
      expect(selectors.columnContent(true, defaultName)).not.toBeInTheDocument();

      fireEvent.click(selectors.fieldEditQuickEnabled(false, defaultName));

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [
            expect.objectContaining({
              newRowEdit: expect.objectContaining({
                enabled: true,
              }),
            }),
            createColumnConfig({
              field: { source: 'B', name: '123' },
            }),
          ],
        })
      );
    });

    it('Should not allow to expand settings if edit disabled', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                field: defaultField,
                newRowEdit: createColumnNewRowEditConfig({
                  enabled: false,
                }),
              }),
            ],
          }),
        })
      );

      expect(selectors.columnContent(true, defaultName)).not.toBeInTheDocument();

      fireEvent.click(selectors.columnHeader(false, defaultName));

      expect(selectors.columnContent(true, defaultName)).not.toBeInTheDocument();
    });

    it('Should allow to set editor config', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                field: defaultField,
                newRowEdit: createColumnNewRowEditConfig({
                  enabled: true,
                  editor: {
                    type: ColumnEditorType.NUMBER,
                  },
                }),
              }),
            ],
          }),
        })
      );

      openSettings(defaultName);

      const editorConfigSelectors = getJestSelectors(TEST_IDS.editableColumnEditor)(screen);
      expect(editorConfigSelectors.fieldNumberMin()).toBeInTheDocument();

      fireEvent.change(editorConfigSelectors.fieldNumberMin(), { target: { value: 10 } });
      fireEvent.blur(editorConfigSelectors.fieldNumberMin(), { target: { value: 10 } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [
            expect.objectContaining({
              newRowEdit: expect.objectContaining({
                editor: {
                  type: ColumnEditorType.NUMBER,
                  min: 10,
                },
              }),
            }),
          ],
        })
      );
    });
  });

  it('Should allow to update permission', () => {
    render(
      getComponent({
        value: createTableConfig({
          addRow: createTableOperationConfig({
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
        addRow: expect.objectContaining({
          permission: createPermissionConfig({
            mode: PermissionMode.QUERY,
          }),
        }),
      })
    );
  });
});
