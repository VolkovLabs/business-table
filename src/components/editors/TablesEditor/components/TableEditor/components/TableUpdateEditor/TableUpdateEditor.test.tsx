import { OrgRole, toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnEditorType, EditPermissionMode } from '@/types';
import { createColumnConfig, createColumnEditConfig, createTableConfig } from '@/utils';

import { TableUpdateEditor } from './TableUpdateEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TableUpdateEditor>;

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

describe('TableUpdateEditor', () => {
  /**
   * Defaults
   */
  const onChange = jest.fn();
  const defaultField = { source: 'A', name: 'hello' };
  const defaultName = 'A:hello';

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.tableUpdateEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TableUpdateEditor onChange={onChange} data={[]} {...(props as any)} />;
  };

  describe('Update Request', () => {
    const openSection = () => {
      expect(selectors.updateSectionHeader()).toBeInTheDocument();

      fireEvent.click(selectors.updateSectionHeader());

      expect(selectors.updateSectionContent()).toBeInTheDocument();
    };

    it('Should allow to change datasource', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                edit: createColumnEditConfig({
                  enabled: true,
                }),
              }),
            ],
          }),
        })
      );

      openSection();

      expect(selectors.datasourceEditor()).toBeInTheDocument();

      fireEvent.change(selectors.datasourceEditor(), { target: { value: 'postgres' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          update: {
            datasource: 'postgres',
            payload: {},
          },
        })
      );
    });

    it('Should allow to change datasource payload', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                edit: createColumnEditConfig({
                  enabled: true,
                }),
              }),
            ],
            update: {
              datasource: 'postgres',
              payload: {},
            },
          }),
        })
      );

      openSection();

      expect(selectors.datasourcePayloadEditor()).toBeInTheDocument();

      fireEvent.change(selectors.datasourcePayloadEditor(), { target: { value: '123' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          update: {
            datasource: 'postgres',
            payload: {},
          },
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

    it('Should allow to set edit permission mode', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                field: defaultField,
                edit: createColumnEditConfig({
                  enabled: true,
                }),
              }),
            ],
          }),
        })
      );

      openSettings(defaultName);

      expect(selectors.fieldEditPermissionMode()).toBeInTheDocument();

      fireEvent.change(selectors.fieldEditPermissionMode(), { target: { value: EditPermissionMode.USER_ROLE } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [
            expect.objectContaining({
              edit: expect.objectContaining({
                permission: expect.objectContaining({
                  mode: EditPermissionMode.USER_ROLE,
                }),
              }),
            }),
          ],
        })
      );
    });

    it('Should allow to set permission user role', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                field: defaultField,
                edit: createColumnEditConfig({
                  enabled: true,
                  permission: {
                    mode: EditPermissionMode.USER_ROLE,
                    userRole: [],
                    field: {
                      source: '',
                      name: '',
                    },
                  },
                }),
              }),
            ],
          }),
        })
      );

      openSettings(defaultName);

      expect(selectors.fieldEditPermissionOrgRole()).toBeInTheDocument();

      fireEvent.change(selectors.fieldEditPermissionOrgRole(), { target: { values: [OrgRole.Admin] } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [
            expect.objectContaining({
              edit: expect.objectContaining({
                permission: expect.objectContaining({
                  userRole: [OrgRole.Admin],
                }),
              }),
            }),
          ],
        })
      );
    });

    it('Should allow to set permission field', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                field: defaultField,
                edit: createColumnEditConfig({
                  enabled: true,
                  permission: {
                    mode: EditPermissionMode.QUERY,
                    userRole: [],
                  },
                }),
              }),
            ],
          }),
          data: [toDataFrame({ refId: 'A', fields: [{ name: 'edit', values: [true] }] })],
        })
      );

      openSettings(defaultName);

      expect(selectors.fieldEditPermissionField()).toBeInTheDocument();

      fireEvent.change(selectors.fieldEditPermissionField(), { target: { value: 'A:edit' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [
            expect.objectContaining({
              edit: expect.objectContaining({
                permission: expect.objectContaining({
                  field: {
                    source: 'A',
                    name: 'edit',
                  },
                }),
              }),
            }),
          ],
        })
      );
    });

    it('Should allow to enable edit in header', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                field: defaultField,
                edit: createColumnEditConfig({
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
              edit: expect.objectContaining({
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

    it('Should allow to enable edit in content', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                field: defaultField,
                edit: createColumnEditConfig({
                  enabled: false,
                }),
              }),
            ],
          }),
        })
      );

      openSettings(defaultName);

      expect(selectors.fieldEditEnabled()).toBeInTheDocument();
      fireEvent.click(selectors.fieldEditEnabled());

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [
            expect.objectContaining({
              edit: expect.objectContaining({
                enabled: true,
              }),
            }),
          ],
        })
      );
    });

    it('Should allow to set editor config', () => {
      render(
        getComponent({
          value: createTableConfig({
            items: [
              createColumnConfig({
                field: defaultField,
                edit: createColumnEditConfig({
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
              edit: expect.objectContaining({
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
});
