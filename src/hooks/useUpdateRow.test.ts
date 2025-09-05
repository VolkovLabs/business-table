import { LoadingState } from '@grafana/data';
import { renderHook } from '@testing-library/react';
import { useDashboardRefresh, useDatasourceRequest } from '@volkovlabs/components';

import { createTableConfig, createTableOperationConfig, createTableRequestConfig } from '@/utils';

import { useUpdateRow } from './useUpdateRow';

describe('useUpdateRow', () => {
  /**
   * Mocks
   */
  const replaceVariables = jest.fn();
  const datasourceRequest = jest.fn();
  const refresh = jest.fn();
  const setError = jest.fn();

  beforeEach(() => {
    jest.mocked(useDatasourceRequest).mockReturnValue(datasourceRequest);
    jest.mocked(useDashboardRefresh).mockImplementation(() => refresh);
  });

  it('Should not update data if no update request', async () => {
    const { result } = renderHook(() =>
      useUpdateRow({
        replaceVariables,
        setError,
        currentTable: createTableConfig({
          update: undefined,
        }),
        operation: 'update',
      })
    );

    await result.current({});

    expect(datasourceRequest).not.toHaveBeenCalled();
  });

  it('Should run datasource update request', async () => {
    const currentTable = createTableConfig({
      update: {
        datasource: 'postgres',
        payload: {},
      },
    });

    datasourceRequest.mockResolvedValue({
      state: LoadingState.Done,
    });

    const { result } = renderHook(() =>
      useUpdateRow({
        replaceVariables,
        currentTable,
        setError,
        operation: 'update',
      })
    );

    const row = { id: 1 };

    await result.current(row);

    expect(datasourceRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: row,
        query: currentTable.update.payload,
        datasource: currentTable.update.datasource,
      })
    );

    /**
     * Should run refresh
     */
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('Should run datasource add request', async () => {
    const currentTable = createTableConfig({
      addRow: createTableOperationConfig({
        enabled: true,
        request: createTableRequestConfig({
          datasource: 'postgres',
          payload: { name: 'hello' },
        }),
      }),
    });

    datasourceRequest.mockResolvedValue({
      state: LoadingState.Done,
    });

    const { result } = renderHook(() =>
      useUpdateRow({
        replaceVariables,
        currentTable,
        setError,
        operation: 'add',
      })
    );

    const row = { id: 1 };

    await result.current(row);

    expect(datasourceRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: row,
        query: currentTable.addRow.request.payload,
        datasource: currentTable.addRow.request.datasource,
      })
    );

    /**
     * Should run refresh
     */
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('Should run datasource delete request', async () => {
    const currentTable = createTableConfig({
      deleteRow: createTableOperationConfig({
        enabled: true,
        request: createTableRequestConfig({
          datasource: 'postgres',
          payload: { name: 'hello' },
        }),
      }),
    });

    datasourceRequest.mockResolvedValue({
      state: LoadingState.Done,
    });

    const { result } = renderHook(() =>
      useUpdateRow({
        replaceVariables,
        currentTable,
        setError,
        operation: 'delete',
      })
    );

    const row = { id: 1 };

    await result.current(row);

    expect(datasourceRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: row,
        query: currentTable.deleteRow.request.payload,
        datasource: currentTable.deleteRow.request.datasource,
      })
    );

    /**
     * Should run refresh
     */
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('Should run datasource delete request with custom message and call replace variables', async () => {
    const replaceVariables = jest.fn((str: string) => str);
    const currentTable = createTableConfig({
      deleteRow: createTableOperationConfig({
        enabled: true,
        request: createTableRequestConfig({
          datasource: 'postgres',
          payload: { name: 'hello' },
        }),
        messages: {
          notifyMessage: 'Custom notify message',
        },
      }),
    });

    datasourceRequest.mockResolvedValue({
      state: LoadingState.Done,
    });

    const { result } = renderHook(() =>
      useUpdateRow({
        replaceVariables,
        currentTable,
        setError,
        operation: 'delete',
      })
    );

    const row = { id: 1 };

    await result.current(row);

    expect(datasourceRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: row,
        query: currentTable.deleteRow.request.payload,
        datasource: currentTable.deleteRow.request.datasource,
      })
    );
    expect(replaceVariables).toHaveBeenCalledWith('Custom notify message');
  });

  it('Should show datasource request error message', async () => {
    const currentTable = createTableConfig({
      update: {
        datasource: 'postgres',
        payload: {},
      },
    });

    datasourceRequest.mockResolvedValue({
      state: LoadingState.Error,
      errors: ['error1'],
    });

    const { result } = renderHook(() =>
      useUpdateRow({
        replaceVariables,
        currentTable,
        setError,
        operation: 'update',
      })
    );

    const row = { id: 1 };

    const e = await result.current(row).catch((e) => e);

    expect(e).toEqual(['error1']);
  });

  it('Should show datasource request error object', async () => {
    const currentTable = createTableConfig({
      update: {
        datasource: 'postgres',
        payload: {},
      },
    });

    const error = new Error('123');
    datasourceRequest.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useUpdateRow({
        replaceVariables,
        currentTable,
        setError,
        operation: 'update',
      })
    );

    const row = { id: 1 };

    const e = await result.current(row).catch((e) => e);

    expect(e).toEqual(error);
  });

  it('Should show unknown error', async () => {
    const currentTable = createTableConfig({
      update: {
        datasource: 'postgres',
        payload: {},
      },
    });

    const error = '123';
    datasourceRequest.mockRejectedValue(error);

    const setError = jest.fn();

    const { result } = renderHook(() =>
      useUpdateRow({
        replaceVariables,
        currentTable,
        setError,
        operation: 'update',
      })
    );

    const row = { id: 1 };

    const e = await result.current(row).catch((e) => e);

    expect(e).toEqual(error);
  });
});
