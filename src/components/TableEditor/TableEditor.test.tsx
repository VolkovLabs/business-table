import { getTemplateSrv } from '@grafana/runtime';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createColumnConfig, createColumnEditConfig, createTableConfig } from '@/utils';

import { TableEditor } from './TableEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TableEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  columnsEditor: createSelector('data-testid columns-editor'),
  datasourceEditor: createSelector('data-testid datasource-editor'),
  datasourcePayloadEditor: createSelector('data-testid datasource-payload-editor'),
};

/**
 * Mock Columns Editor
 */
jest.mock('../ColumnsEditor', () => ({
  ColumnsEditor: ({ value, onChange }: any) => (
    <input {...inTestIds.columnsEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

/**
 * Mock Datasource Editor
 */
jest.mock('../DatasourceEditor', () => ({
  DatasourceEditor: ({ onChange }: any) => (
    <input {...inTestIds.datasourceEditor.apply()} onChange={(event) => onChange(event.currentTarget.value)} />
  ),
}));

/**
 * Mock Datasource Payload Editor
 */
jest.mock('../DatasourcePayloadEditor', () => ({
  DatasourcePayloadEditor: ({ value, onChange }: any) => (
    <input {...inTestIds.datasourcePayloadEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

describe('TableEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.tableEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TableEditor onChange={onChange} data={[]} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([]);
  });

  it('Should allow to change columns', () => {
    render(
      getComponent({
        value: createTableConfig({
          items: [createColumnConfig({})],
        }),
      })
    );

    expect(selectors.columnsEditor()).toBeInTheDocument();

    fireEvent.change(selectors.columnsEditor(), { target: { value: '123' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [createColumnConfig({})],
      })
    );
  });

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
});
