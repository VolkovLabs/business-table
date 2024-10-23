import { AppEvents, LoadingState } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { sceneGraph, SceneObject } from '@grafana/scenes';
import { renderHook } from '@testing-library/react';
import { useDashboardRefresh } from '@volkovlabs/components';

import { createTableConfig } from '@/utils';

import { useDatasourceRequest } from './useDatasourceRequest';
import { useUpdateRow } from './useUpdateRow';

/**
 * Mock useDatasourceRequest
 */
jest.mock('./useDatasourceRequest', () => ({
  useDatasourceRequest: jest.fn(),
}));

/**
 * Mock @volkovlabs/components
 */
jest.mock('@volkovlabs/components', () => ({
  ...jest.requireActual('@volkovlabs/components'),
  useDashboardRefresh: jest.fn(),
}));

describe('useUpdateRow', () => {
  /**
   * Mocks
   */
  const replaceVariables = jest.fn();
  const datasourceRequest = jest.fn();
  const refresh = jest.fn();

  beforeEach(() => {
    jest.mocked(useDatasourceRequest).mockReturnValue(datasourceRequest);
    jest.mocked(useDashboardRefresh).mockImplementation(() => refresh);
  });

  it('Should not update data if no update request', async () => {
    const { result } = renderHook(() =>
      useUpdateRow({
        replaceVariables,
        currentTable: createTableConfig({
          update: undefined,
        }),
      })
    );

    await result.current({});

    expect(datasourceRequest).not.toHaveBeenCalled();
  });

  it('Should run datasource request', async () => {
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
      })
    );

    const row = { id: 1 };

    const e = await result.current(row).catch((e) => e);

    expect(e).toEqual(['error1']);

    /**
     * Check if dashboard refreshed
     */
    expect(getAppEvents().publish).toHaveBeenCalledWith({
      type: AppEvents.alertError.name,
      payload: ['Error', 'error1'],
    });
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
      })
    );

    const row = { id: 1 };

    const e = await result.current(row).catch((e) => e);

    expect(e).toEqual(error);

    /**
     * Check if dashboard refreshed
     */
    expect(getAppEvents().publish).toHaveBeenCalledWith({
      type: AppEvents.alertError.name,
      payload: ['Error', error],
    });
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

    const { result } = renderHook(() =>
      useUpdateRow({
        replaceVariables,
        currentTable,
      })
    );

    const row = { id: 1 };

    const e = await result.current(row).catch((e) => e);

    expect(e).toEqual(error);

    /**
     * Check if dashboard refreshed
     */
    expect(getAppEvents().publish).toHaveBeenCalledWith({
      type: AppEvents.alertError.name,
      payload: ['Error', 'Unknown Error'],
    });
  });
});
