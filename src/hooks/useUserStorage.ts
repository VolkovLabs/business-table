import { usePluginUserStorage } from '@grafana/runtime';

import { useLocalStorage } from './useLocalStorage';

/**
 * User Storage
 * Should be rewrite and simplified or removed for minimal grafana version 11.5.0 for plugin. Use usePluginUserStorage only
 */
export const useUserStorage = (version: number) => {
  const localStorage = useLocalStorage(version);
  /**
   * Avoid plugin crush for grafana versions lt 11.5.0
   */
  try {
    const storage = usePluginUserStorage();
    const update = async <T>(key: string, data: T) => {
      await storage.setItem(key, JSON.stringify(data));
      return data;
    };

    const get = async (key: string) => {
      const storageValue = await storage.getItem(key);

      if (storageValue) {
        return JSON.parse(storageValue);
      }

      return undefined;
    };

    return {
      setItem: update,
      getItem: get,
    };
  } catch {
    return localStorage;
  }
};
