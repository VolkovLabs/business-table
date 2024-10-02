import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, PaginationMode } from '@/types';
import { createColumnConfig, createColumnFilterConfig, createTableConfig, createTablePaginationConfig } from '@/utils';
import { toDataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { PaginationEditor } from './PaginationEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof PaginationEditor>;

describe('PaginationEditor', () => {
  /**
   * Defaults
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.paginationEditor });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <PaginationEditor onChange={onChange} data={[]} {...(props as any)} />;
  };

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

  it('Should not allow to set query mode if disabled', () => {
    render(
      getComponent({
        value: createTableConfig({
          items: [
            createColumnConfig({
              enabled: true,
              filter: createColumnFilterConfig({
                enabled: true,
                mode: ColumnFilterMode.CLIENT,
              }),
            }),
          ],
          pagination: createTablePaginationConfig({
            enabled: true,
            mode: undefined,
          }),
        }),
      })
    );

    expect(selectors.fieldPaginationMode()).toBeInTheDocument();

    fireEvent.change(selectors.fieldPaginationMode(), { target: { value: PaginationMode.QUERY } });

    expect(onChange).not.toHaveBeenCalled();
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
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([{ name: 'pageSize' } as any]);

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
