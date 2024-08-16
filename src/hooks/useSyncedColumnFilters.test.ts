import { EventBusSrv } from '@grafana/data';
import { RefreshEvent } from '@grafana/runtime';
import { act, renderHook } from '@testing-library/react';

import { ColumnFilterType } from '@/types';
import { getVariableColumnFilters, mergeColumnFilters } from '@/utils';

import { useSyncedColumnFilters } from './useSyncedColumnFilters';

/**
 * Mock Utils
 */
jest.mock('@/utils', () => ({
  mergeColumnFilters: jest.fn(),
  getVariableColumnFilters: jest.fn(),
}));

describe('useSyncedColumnFilters', () => {
  /**
   * Event Bus
   */
  const eventBus = new EventBusSrv();

  it('Should set initial filter values', async () => {
    const filterFromVariable = {
      id: 'a',
      value: {
        type: ColumnFilterType.SEARCH,
        value: '1',
        caseSensitive: false,
      },
    };
    jest.mocked(getVariableColumnFilters).mockImplementation(() => [filterFromVariable] as any);
    jest.mocked(mergeColumnFilters).mockImplementation((current, updated) => current.concat(updated));

    const columns = [] as any;

    const { result } = await act(async () =>
      renderHook(() =>
        useSyncedColumnFilters({
          columns: columns as any,
          eventBus,
        })
      )
    );

    expect(result.current[0]).toEqual([filterFromVariable]);
  });

  it('Should refresh filter values', async () => {
    const filterFromVariable = {
      id: 'a',
      value: {
        type: ColumnFilterType.SEARCH,
        value: '1',
        caseSensitive: false,
      },
    };
    jest.mocked(getVariableColumnFilters).mockImplementation(() => []);
    jest.mocked(mergeColumnFilters).mockImplementation((current, updated) => current.concat(updated));

    const columns = [] as any;

    const { result } = await act(async () =>
      renderHook(() =>
        useSyncedColumnFilters({
          columns: columns as any,
          eventBus,
        })
      )
    );

    expect(result.current[0]).toEqual([]);

    jest.mocked(getVariableColumnFilters).mockImplementation(() => [filterFromVariable] as any);

    /**
     * Refresh
     */
    await act(async () => eventBus.publish(new RefreshEvent()));

    /**
     * Check filters updated
     */
    expect(result.current[0]).toEqual([filterFromVariable]);
  });

  it('Should allow to set updated filters', async () => {
    jest.mocked(getVariableColumnFilters).mockImplementation(() => []);
    jest.mocked(mergeColumnFilters).mockImplementation((current, updated) => current.concat(updated));

    const columns = [] as any;

    const { result } = await act(async () =>
      renderHook(() =>
        useSyncedColumnFilters({
          columns: columns as any,
          eventBus,
        })
      )
    );

    expect(result.current[0]).toEqual([]);

    const newFilter = {
      id: 'a',
      value: {
        type: ColumnFilterType.SEARCH,
        value: '1',
        caseSensitive: false,
      },
    };

    /**
     * Update
     */
    await act(async () => result.current[1]([newFilter]));

    expect(result.current[0]).toEqual([newFilter]);
  });
});
