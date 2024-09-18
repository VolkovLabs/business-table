import { EventBusSrv, toDataFrame } from '@grafana/data';
import { getTemplateSrv, locationService } from '@grafana/runtime';
import { act, renderHook } from '@testing-library/react';

import { PaginationMode } from '@/types';
import { createTablePaginationConfig } from '@/utils';

import { usePagination } from './usePagination';

describe('usePagination', () => {
  /**
   * Event Bus
   */
  const eventBus = new EventBusSrv();

  /**
   * Total Frame
   */
  const totalFrame = toDataFrame({
    refId: 'A',
    fields: [{ name: 'total', values: [10500] }],
  });

  /**
   * Create Variable
   */
  const createVar = (name: string, value?: unknown): any => {
    const res: any = {
      name,
    };

    if (value !== undefined) {
      res.current = {
        value: typeof value === 'number' ? String(value) : value,
      };
    }

    return res;
  };

  beforeEach(() => {
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([]);
  });

  it('Should work for client mode', async () => {
    const paginationConfig = createTablePaginationConfig({ enabled: true, mode: PaginationMode.CLIENT });

    const { result } = await act(async () =>
      renderHook(() =>
        usePagination({
          paginationConfig,
          data: [],
          eventBus,
        })
      )
    );

    expect(result.current).toEqual(
      expect.objectContaining({
        isEnabled: true,
        isManual: false,
        value: {
          pageIndex: 0,
          pageSize: 10,
        },
        total: 0,
      })
    );

    await act(async () => result.current.onChange({ pageIndex: 1, pageSize: 20 }));

    expect(result.current).toEqual(
      expect.objectContaining({
        value: {
          pageIndex: 1,
          pageSize: 20,
        },
      })
    );
  });

  describe('query', () => {
    it('Should return total from field', async () => {
      const paginationConfig = createTablePaginationConfig({
        enabled: true,
        mode: PaginationMode.QUERY,
        query: {
          totalCountField: {
            name: 'total',
            source: 'A',
          },
        },
      });

      const { result } = await act(async () =>
        renderHook(() =>
          usePagination({
            paginationConfig,
            data: [totalFrame],
            eventBus,
          })
        )
      );

      expect(result.current.total).toEqual(10500);
    });

    it('Should make fallback if no frame with total', async () => {
      const paginationConfig = createTablePaginationConfig({
        enabled: true,
        mode: PaginationMode.QUERY,
        query: {
          totalCountField: {
            name: 'total',
            source: 'A',
          },
        },
      });

      const { result } = await act(async () =>
        renderHook(() =>
          usePagination({
            paginationConfig,
            data: [],
            eventBus,
          })
        )
      );

      expect(result.current.total).toEqual(20);

      await act(async () => result.current.onChange({ pageIndex: 1, pageSize: 15 }));

      expect(result.current.total).toEqual(45);
    });

    it('Should take initial values from variables', async () => {
      const paginationConfig = createTablePaginationConfig({
        enabled: true,
        mode: PaginationMode.QUERY,
        query: {
          pageIndexVariable: 'pageIndex',
          pageSizeVariable: 'pageSize',
        },
      });

      jest
        .mocked(getTemplateSrv().getVariables)
        .mockReturnValue([createVar('pageIndex', 2), createVar('pageSize', 100)]);

      const { result } = await act(async () =>
        renderHook(() =>
          usePagination({
            paginationConfig,
            data: [],
            eventBus,
          })
        )
      );

      expect(result.current.value).toEqual({
        pageIndex: 2,
        pageSize: 100,
      });
    });

    it('Should set initial value if no variables values', async () => {
      const paginationConfig = createTablePaginationConfig({
        enabled: true,
        mode: PaginationMode.QUERY,
        query: {
          pageIndexVariable: 'pageIndex',
          pageSizeVariable: 'pageSize',
        },
      });

      jest.mocked(getTemplateSrv().getVariables).mockReturnValue([createVar('pageIndex'), createVar('pageSize')]);

      const { result } = await act(async () =>
        renderHook(() =>
          usePagination({
            paginationConfig,
            data: [],
            eventBus,
          })
        )
      );

      expect(result.current.value).toEqual({
        pageIndex: 0,
        pageSize: 10,
      });
    });

    it('Should calculate pageIndex from offset variable', async () => {
      const paginationConfig = createTablePaginationConfig({
        enabled: true,
        mode: PaginationMode.QUERY,
        query: {
          offsetVariable: 'offset',
          pageSizeVariable: 'pageSize',
        },
      });

      jest
        .mocked(getTemplateSrv().getVariables)
        .mockReturnValue([createVar('offset', 400), createVar('pageSize', 100)]);

      const { result } = await act(async () =>
        renderHook(() =>
          usePagination({
            paginationConfig,
            data: [],
            eventBus,
          })
        )
      );

      expect(result.current.value).toEqual({
        pageIndex: 4,
        pageSize: 100,
      });
    });

    it('Should update variables on change', async () => {
      const paginationConfig = createTablePaginationConfig({
        enabled: true,
        mode: PaginationMode.QUERY,
        query: {
          pageIndexVariable: 'pageIndex',
          offsetVariable: 'offset',
          pageSizeVariable: 'pageSize',
        },
      });

      jest
        .mocked(getTemplateSrv().getVariables)
        .mockReturnValue([createVar('pageIndex', 0), createVar('pageSize', 10), createVar('offset', 0)]);

      const { result } = await act(async () =>
        renderHook(() =>
          usePagination({
            paginationConfig,
            data: [],
            eventBus,
          })
        )
      );

      expect(result.current.value).toEqual({
        pageIndex: 0,
        pageSize: 10,
      });

      await act(async () =>
        result.current.onChange(() => ({
          pageSize: 100,
          pageIndex: 15,
        }))
      );

      expect(locationService.partial).toHaveBeenCalledWith(
        {
          [`var-${paginationConfig.query?.pageIndexVariable}`]: 15,
          [`var-${paginationConfig.query?.pageSizeVariable}`]: 100,
          [`var-${paginationConfig.query?.offsetVariable}`]: 1500,
        },
        true
      );
    });
  });
});
