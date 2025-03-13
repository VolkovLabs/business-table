import { config, usePluginUserStorage } from '@grafana/runtime';
import { act, renderHook } from '@testing-library/react';

import { useUserStorage } from './useUserStorage';

jest.mock('@grafana/runtime', () => ({
  config: { buildInfo: { version: '11.5.0' } },
  usePluginUserStorage: jest.fn(),
}));

describe('useUserStorage', () => {
  const mockStorage = {
    getItem: jest.fn(() => Promise.resolve('')),
    setItem: jest.fn(() => Promise.resolve()),
  };

  const setGrafanaVersion = (version: string) => {
    Object.assign(config.buildInfo, { version });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(usePluginUserStorage).mockReturnValue(mockStorage);
    setGrafanaVersion('11.5.0');
  });

  it('Should initialize userPreferences from storage for Grafana >= 11.5.0', async () => {
    mockStorage.getItem.mockResolvedValueOnce(Promise.resolve(JSON.stringify({ test: 'value' })));

    const { result } = await act(async () =>
      renderHook(() =>
        useUserStorage({
          id: 1,
          options: { isColumnMangerAvailable: true, saveUserPreference: true } as any,
        })
      )
    );

    expect(mockStorage.getItem).toHaveBeenCalledWith('volkovlabs.table.panel.1.user.preferences');
    expect(result.current.userPreferences).toEqual({ test: 'value' });
  });

  it('Should set user preferences from localStorage for Grafana < 11.5.0', async () => {
    setGrafanaVersion('11.4.0');

    const userLocalStoragePreference = JSON.stringify({ test: 'value' });

    const { result } = renderHook(() =>
      useUserStorage({
        id: 1,
        options: { isColumnMangerAvailable: true, saveUserPreference: true } as any,
      })
    );

    await act(async () => {
      result.current.setStorage(JSON.parse(userLocalStoragePreference));
    });

    expect(result.current.userPreferences).toEqual({ test: 'value' });
  });

  it('Should save user preferences to storage', async () => {
    const { result } = await act(async () =>
      renderHook(() => useUserStorage({ id: 1, options: { saveUserPreference: true } as any }))
    );

    await act(async () => {
      result.current.setStorage({ tables: [] });
    });

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'volkovlabs.table.panel.1.user.preferences',
      JSON.stringify({ tables: [] })
    );
  });

  it('Should update table preferences', async () => {
    const { result } = await act(async () =>
      renderHook(() => useUserStorage({ id: 1, options: { saveUserPreference: true } as any }))
    );

    await act(async () => {
      result.current.updateTablesPreferences('TestTable', [{ name: 'Column1' }]);
    });

    expect(result.current.userPreferences.tables).toEqual([{ name: 'TestTable', columns: [{ name: 'Column1' }] }]);
  });

  it('Should clear preferences', async () => {
    const { result } = await act(async () =>
      renderHook(() => useUserStorage({ id: 1, options: { saveUserPreference: true } as any }))
    );

    await act(async () => {
      result.current.setStorage({ tables: [] });
    });

    await act(async () => {
      result.current.clearPreferences();
    });

    expect(result.current.userPreferences).toEqual({});
    expect(mockStorage.setItem).toHaveBeenCalledWith('volkovlabs.table.panel.1.user.preferences', JSON.stringify({}));
  });

  it('Should update existing table preferences', async () => {
    const { result } = renderHook(() => useUserStorage({ id: 1, options: { saveUserPreference: true } as any }));

    await act(async () => {
      result.current.updateTablesPreferences('TestTable', [{ name: 'column 1', enabled: true }]);
    });

    expect(result.current.userPreferences.tables).toEqual([
      { name: 'TestTable', columns: [{ name: 'column 1', enabled: true }] },
    ]);

    await act(async () => {
      result.current.updateTablesPreferences('TestTable2', [{ name: 'column 2', enabled: true }]);
    });

    expect(result.current.userPreferences.tables).toEqual([
      { name: 'TestTable', columns: [{ name: 'column 1', enabled: true }] },
      { name: 'TestTable2', columns: [{ name: 'column 2', enabled: true }] },
    ]);

    await act(async () => {
      result.current.updateTablesPreferences('TestTable', [
        { name: 'column 1', enabled: true },
        { name: 'column 2', enabled: true },
      ]);
    });

    expect(result.current.userPreferences.tables).toEqual([
      {
        name: 'TestTable',
        columns: [
          { name: 'column 1', enabled: true },
          { name: 'column 2', enabled: true },
        ],
      },
      { name: 'TestTable2', columns: [{ name: 'column 2', enabled: true }] },
    ]);
  });
});
