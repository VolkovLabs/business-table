import { useLocalStorage } from './useLocalStorage';
import { useUserStorage } from './useUserStorage';

/**
 * User Storage
 * Should be rewrite and simplified or removed for minimal grafana version 11.5.0 for plugin. Use usePluginUserStorage only
 */
export const useStorage = (key: string, version: number) => {
  /**
   * Define local storage
   */
  const localStorage = useLocalStorage(key, version);

  /**
   * Avoid plugin crush for grafana versions lt 11.5.0
   */
  try {
    return useUserStorage(key, version);
  } catch {
    return localStorage;
  }
};
