import { useCallback, useMemo } from 'react';

/**
 * Local Storage Model
 */
export const useLocalStorage = (version: number) => {
  const get = useCallback(
    async (key: string) => {
      const json = window.localStorage.getItem(key);
      if (json) {
        const parsed = JSON.parse(json);

        if (parsed?.version === version) {
          return parsed.data;
        }

        return undefined;
      }

      return undefined;
    },
    [version]
  );

  /**
   * Update
   */
  const update = useCallback(
    async <T>(key: string, data: T) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version,
          data,
        })
      );
      return data;
    },
    [version]
  );

  return useMemo(
    () => ({
      getItem: get,
      setItem: update,
    }),
    [get, update]
  );
};
