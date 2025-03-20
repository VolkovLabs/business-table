import { usePluginUserStorage } from '@grafana/runtime';
import { act, renderHook } from '@testing-library/react';

import { useUserStorage } from './useUserStorage';

jest.mock('@grafana/runtime', () => ({
  usePluginUserStorage: jest.fn(),
}));

describe('useUserStorage', () => {
  const version = 1;
  const mockStorage = {
    getItem: jest.fn(() => Promise.resolve('')),
    setItem: jest.fn(() => Promise.resolve()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(usePluginUserStorage).mockReturnValue(mockStorage);
  });

  it('Should initialize userPreferences from storage for Grafana >= 11.5.0', async () => {
    mockStorage.getItem.mockResolvedValueOnce(Promise.resolve(JSON.stringify({ test: 'value' })));

    const { result } = await act(async () => renderHook(() => useUserStorage(version)));

    expect(result.current).toEqual(
      expect.objectContaining({
        setItem: expect.any(Function),
        getItem: expect.any(Function),
      })
    );
  });

  it('Should return undefined when userStorage is null', async () => {
    jest.mocked(usePluginUserStorage).mockReturnValue(null);
    const { result } = renderHook(() => useUserStorage(version));

    await expect(result.current.getItem('testKey')).resolves.toBeUndefined();
  });

  it('Should store item correctly', async () => {
    const { result } = renderHook(() => useUserStorage(version));
    await act(async () => {
      await result.current.setItem('testKey', { data: 'value' });
    });

    expect(mockStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify({ data: 'value' }));
  });

  it('Should return parsed data from storage', async () => {
    mockStorage.getItem.mockResolvedValueOnce(JSON.stringify({ data: 'value' }));
    const { result } = renderHook(() => useUserStorage(version));
    await act(async () => {
      const data = await result.current.getItem('testKey');
      expect(data).toEqual({ data: 'value' });
    });
  });
});
