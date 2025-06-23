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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getVariableColumnFilters).mockReturnValue([]);
    jest.mocked(mergeColumnFilters).mockImplementation((current, updated) => [...current, ...updated]);
  });

  it('Should set initial filter values from variables', async () => {
    const filterFromVariable = {
      id: 'a',
      value: {
        type: ColumnFilterType.SEARCH,
        value: '1',
        caseSensitive: false,
      },
    };

    jest.mocked(getVariableColumnFilters).mockReturnValue([filterFromVariable] as any);

    const columns = [] as any;

    const { result } = renderHook(() =>
      useSyncedColumnFilters({
        columns: columns as any,
        eventBus,
        userFilterPreference: [],
      })
    );

    expect(result.current[0]).toEqual([filterFromVariable]);
  });

  it('Should set default filters when no user preferences and no variable filters', async () => {
    const columns = [
      {
        id: 'column1',
        meta: {
          config: {
            filter: {
              defaultClientValue: 'default_value_1',
            },
          },
        },
      },
      {
        id: 'column2',
        meta: {
          config: {
            filter: {
              defaultClientValue: 'default_value_2',
            },
          },
        },
      },
    ] as any;

    jest.mocked(getVariableColumnFilters).mockReturnValue([]);

    const { result } = renderHook(() =>
      useSyncedColumnFilters({
        columns,
        eventBus,
        userFilterPreference: [],
      })
    );

    const expectedDefaultFilters = [
      { id: 'column1', value: 'default_value_1' },
      { id: 'column2', value: 'default_value_2' },
    ];

    expect(result.current[0]).toEqual(expectedDefaultFilters);
  });

  it('Should prioritize user preferences over default and variable filters', async () => {
    const userFilterPreference = [
      {
        id: 'b',
        value: {
          type: ColumnFilterType.SEARCH,
          value: 'test',
          caseSensitive: false,
        },
      },
    ];

    const filterFromVariable = {
      id: 'a',
      value: {
        type: ColumnFilterType.SEARCH,
        value: '1',
        caseSensitive: false,
      },
    };

    const columns = [
      {
        id: 'column1',
        meta: {
          config: {
            filter: {
              defaultClientValue: 'default_value_1',
            },
          },
        },
      },
    ] as any;

    jest.mocked(getVariableColumnFilters).mockReturnValue([filterFromVariable] as any);

    const { result } = renderHook(() =>
      useSyncedColumnFilters({
        columns,
        eventBus,
        userFilterPreference,
      })
    );

    expect(result.current[0][0]).toEqual({
      id: 'b',
      value: {
        type: ColumnFilterType.SEARCH,
        value: 'test',
        caseSensitive: false,
      },
    });
  });

  it('Should combine default and variable filters when no user preferences', async () => {
    const filterFromVariable = {
      id: 'a',
      value: {
        type: ColumnFilterType.SEARCH,
        value: '1',
        caseSensitive: false,
      },
    };

    const columns = [
      {
        id: 'column1',
        meta: {
          config: {
            filter: {
              defaultClientValue: 'default_value_1',
            },
          },
        },
      },
    ] as any;

    jest.mocked(getVariableColumnFilters).mockReturnValue([filterFromVariable] as any);

    renderHook(() =>
      useSyncedColumnFilters({
        columns,
        eventBus,
        userFilterPreference: [],
      })
    );

    expect(mergeColumnFilters).toHaveBeenCalledWith(
      [{ id: 'column1', value: 'default_value_1' }],
      [filterFromVariable]
    );
  });

  it('Should refresh filter values on event', async () => {
    const initialFilter = {
      id: 'initial',
      value: 'initial_value',
    };

    const updatedFilter = {
      id: 'a',
      value: {
        type: ColumnFilterType.SEARCH,
        value: '1',
        caseSensitive: false,
      },
    };

    jest.mocked(getVariableColumnFilters).mockReturnValue([initialFilter] as any);

    const columns = [] as any;

    const { result } = renderHook(() =>
      useSyncedColumnFilters({
        columns: columns as any,
        eventBus,
        userFilterPreference: [],
      })
    );

    expect(result.current[0]).toEqual([initialFilter]);

    jest.mocked(getVariableColumnFilters).mockReturnValue([updatedFilter] as any);

    /**
     * Refresh
     */
    act(() => {
      eventBus.publish(new RefreshEvent());
    });

    /**
     * Check filters updated
     */
    expect(mergeColumnFilters).toHaveBeenCalledWith([initialFilter], [updatedFilter]);
  });

  it('Should allow to set updated filters manually', async () => {
    jest.mocked(getVariableColumnFilters).mockReturnValue([]);

    const columns = [] as any;

    const { result } = renderHook(() =>
      useSyncedColumnFilters({
        columns: columns as any,
        eventBus,
        userFilterPreference: [],
      })
    );

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
    act(() => {
      result.current[1]([newFilter]);
    });

    expect(result.current[0]).toEqual([newFilter]);
  });

  it('Should handle columns without default filters', async () => {
    const columns = [
      {
        id: 'column1',
      },
      {
        id: 'column2',
        meta: {
          config: {},
        },
      },
      {
        id: 'column3',
        meta: {
          config: {
            filter: {},
          },
        },
      },
    ] as any;

    jest.mocked(getVariableColumnFilters).mockReturnValue([]);

    const { result } = renderHook(() =>
      useSyncedColumnFilters({
        columns,
        eventBus,
        userFilterPreference: [],
      })
    );

    expect(result.current[0]).toEqual([]);
  });
});
