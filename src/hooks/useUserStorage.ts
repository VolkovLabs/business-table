import { usePluginUserStorage } from '@grafana/runtime';
import { useCallback } from 'react';

import { PluginUserStorage } from '@/types';

import { useLocalStorage } from './useLocalStorage';

/**
 * User Storage
 * Should be rewrite and simplified or removed for minimal grafana version 11.5.0 for plugin. Use usePluginUserStorage only
 */
export const useUserStorage = (version: number) => {
  const localStorage = useLocalStorage(version);

  /**
   * Define user storage
   */
  let userStorage: PluginUserStorage | null = null;

  /**
   * Define get user storage
   * should be useCallback
   * to avoid using userStorage.getItem directly
   * using userStorage.getItem directly in useEffect can cause an infinite call
   */
  const getUserStorageValue = useCallback(
    async (key: string) => {
      if (!userStorage) {
        return undefined;
      }
      const storageValue = await userStorage.getItem(key);

      if (storageValue) {
        return JSON.parse(storageValue);
      }

      return undefined;
    },
    [userStorage]
  );

  /**
   * Avoid plugin crush for grafana versions lt 11.5.0
   */
  try {
    /**
     * use usePluginUserStorage hook
     */
    const storage = usePluginUserStorage();
    userStorage = storage;

    /**
     * override storage.setItem to be like useLocalStorage
     */
    const update = async <T>(key: string, data: T) => {
      await storage.setItem(key, JSON.stringify(data));
      return data;
    };

    return {
      setItem: update,
      getItem: getUserStorageValue,
    };
  } catch {
    return localStorage;
  }
};
