import { toDataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { PaginationMode } from '@/types';
import { createColumnConfig, createColumnEditConfig, createTableConfig, createTablePaginationConfig } from '@/utils';

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

  describe('pagination', () => {
    const openSection = () => {
      expect(selectors.paginationSectionHeader()).toBeInTheDocument();

      fireEvent.click(selectors.paginationSectionHeader());

      expect(selectors.paginationSectionContent()).toBeInTheDocument();
    };

    it('Should allow to enable', () => {
      render(
        getComponent({
          value: createTableConfig({
            pagination: createTablePaginationConfig({
              enabled: false,
            }),
          }),
        })
      );

      expect(selectors.fieldPaginationEnabled()).toBeInTheDocument();

      fireEvent.click(selectors.fieldPaginationEnabled());

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            enabled: true,
          }),
        })
      );
    });

    it('Should allow to change mode', () => {
      render(
        getComponent({
          value: createTableConfig({
            pagination: createTablePaginationConfig({
              enabled: true,
              mode: PaginationMode.CLIENT,
            }),
          }),
        })
      );

      openSection();

      expect(selectors.fieldPaginationMode()).toBeInTheDocument();

      fireEvent.change(selectors.fieldPaginationMode(), { target: { value: PaginationMode.QUERY } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            mode: PaginationMode.QUERY,
          }),
        })
      );
    });

    it('Should allow to change query pageIndex var', () => {
      jest.mocked(getTemplateSrv().getVariables).mockReturnValue([{ name: 'pageIndex' } as any]);

      render(
        getComponent({
          value: createTableConfig({
            pagination: createTablePaginationConfig({
              enabled: true,
              mode: PaginationMode.QUERY,
              query: {
                pageIndexVariable: '',
              },
            }),
          }),
        })
      );

      openSection();

      expect(selectors.fieldPaginationQueryPageIndexVariable()).toBeInTheDocument();

      fireEvent.change(selectors.fieldPaginationQueryPageIndexVariable(), { target: { value: 'pageIndex' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            query: expect.objectContaining({
              pageIndexVariable: 'pageIndex',
            }),
          }),
        })
      );
    });

    it('Should allow to clear query pageIndex var', () => {
      jest.mocked(getTemplateSrv().getVariables).mockReturnValue([{ name: 'pageIndex' } as any]);

      render(
        getComponent({
          value: createTableConfig({
            pagination: createTablePaginationConfig({
              enabled: true,
              mode: PaginationMode.QUERY,
              query: {
                pageIndexVariable: 'pageIndex',
              },
            }),
          }),
        })
      );

      openSection();

      expect(selectors.fieldPaginationQueryPageIndexVariable()).toBeInTheDocument();

      fireEvent.change(selectors.fieldPaginationQueryPageIndexVariable(), { target: { value: '' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            query: {},
          }),
        })
      );
    });

    it('Should allow to change query offset var', () => {
      jest.mocked(getTemplateSrv().getVariables).mockReturnValue([{ name: 'offset' } as any]);

      render(
        getComponent({
          value: createTableConfig({
            pagination: createTablePaginationConfig({
              enabled: true,
              mode: PaginationMode.QUERY,
              query: {
                offsetVariable: '',
              },
            }),
          }),
        })
      );

      openSection();

      expect(selectors.fieldPaginationQueryOffsetVariable()).toBeInTheDocument();

      fireEvent.change(selectors.fieldPaginationQueryOffsetVariable(), { target: { value: 'offset' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            query: expect.objectContaining({
              offsetVariable: 'offset',
            }),
          }),
        })
      );
    });

    it('Should allow to clear query offset var', () => {
      jest.mocked(getTemplateSrv().getVariables).mockReturnValue([{ name: 'offset' } as any]);

      render(
        getComponent({
          value: createTableConfig({
            pagination: createTablePaginationConfig({
              enabled: true,
              mode: PaginationMode.QUERY,
              query: {
                offsetVariable: 'offset',
              },
            }),
          }),
        })
      );

      openSection();

      expect(selectors.fieldPaginationQueryOffsetVariable()).toBeInTheDocument();

      fireEvent.change(selectors.fieldPaginationQueryOffsetVariable(), { target: { value: '' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            query: {},
          }),
        })
      );
    });

    it('Should allow to change query pageSize var', () => {
      jest.mocked(getTemplateSrv().getVariables).mockReturnValue([{ name: 'pageSize' } as any]);

      render(
        getComponent({
          value: createTableConfig({
            pagination: createTablePaginationConfig({
              enabled: true,
              mode: PaginationMode.QUERY,
              query: {
                pageSizeVariable: '',
              },
            }),
          }),
        })
      );

      openSection();

      expect(selectors.fieldPaginationQueryPageSizeVariable()).toBeInTheDocument();

      fireEvent.change(selectors.fieldPaginationQueryPageSizeVariable(), { target: { value: 'pageSize' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            query: expect.objectContaining({
              pageSizeVariable: 'pageSize',
            }),
          }),
        })
      );
    });

    it('Should allow to clear query pageSize var', () => {
      jest.mocked(getTemplateSrv().getVariables).mockReturnValue([{ name: 'pageSize' } as any]);

      render(
        getComponent({
          value: createTableConfig({
            pagination: createTablePaginationConfig({
              enabled: true,
              mode: PaginationMode.QUERY,
              query: {
                pageSizeVariable: 'pageSize',
              },
            }),
          }),
        })
      );

      openSection();

      expect(selectors.fieldPaginationQueryPageSizeVariable()).toBeInTheDocument();

      fireEvent.change(selectors.fieldPaginationQueryPageSizeVariable(), { target: { value: '' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            query: {},
          }),
        })
      );
    });

    it('Should allow to change query totalCount field', () => {
      const frame = toDataFrame({
        refId: 'A',
        fields: [{ name: 'total', values: [100] }],
      });

      render(
        getComponent({
          value: createTableConfig({
            pagination: createTablePaginationConfig({
              enabled: true,
              mode: PaginationMode.QUERY,
              query: {},
            }),
          }),
          data: [frame],
        })
      );

      openSection();

      expect(selectors.fieldPaginationQueryTotalCount()).toBeInTheDocument();

      fireEvent.change(selectors.fieldPaginationQueryTotalCount(), { target: { value: 'A:total' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            query: expect.objectContaining({
              totalCountField: {
                source: frame.refId,
                name: 'total',
              },
            }),
          }),
        })
      );
    });
  });
});
