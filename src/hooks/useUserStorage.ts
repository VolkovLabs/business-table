import { usePluginUserStorage } from '@grafana/runtime';
import { useCallback, useMemo } from 'react';

/**
 * User Storage Model
 */
export const useUserStorage = (key: string, version: number) => {
  const storage = usePluginUserStorage();

  /**
   * Get user storage
   * should be useCallback
   * use it in a way similar to useLocalStorage
   * using userStorage.getItem directly in useEffect can cause an infinite call
   */
  const get = useCallback(async () => {
    const json = await storage.getItem(key);

    if (json) {
      const parsed = JSON.parse(json);

      if (parsed?.version === version) {
        return parsed.data;
      }

      return undefined;
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);

  /**
   * Update
   * use it in a way similar to useLocalStorage
   */
  const update = useCallback(
    async <T>(data: T) => {
      await storage.setItem(
        key,
        JSON.stringify({
          version,
          data,
        })
      );

      return data;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, version]
  );

  return useMemo(
    () => ({
      get,
      update,
    }),
    [get, update]
  );
};
