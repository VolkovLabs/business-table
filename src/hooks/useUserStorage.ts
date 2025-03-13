import { config, usePluginUserStorage } from '@grafana/runtime';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import semver from 'semver';

import { ColumnItem, PanelOptions, PluginUserStorage, UserPreferences } from '@/types';

import { useSavedState } from './useSavedState';

/**
 * User Storage
 * Should be rewrite and simplified for minimal grafana version 11.5.0 for plugin. Use usePluginUserStorage only
 * currentGroup, userLocalStoragePreference should be save with usePluginUserStorage
 */
export const useUserStorage = ({ id, options }: { id: number; options: PanelOptions }) => {
  /**
   * Current group
   * use for grafana versions less than 11.5.0
   */
  const [currentGroup, setCurrentGroup] = useSavedState<string>({
    key: `volkovlabs.table.panel.${id}`,
    initialValue: options.tables?.[0]?.name || '',
  });

  /**
   * userLocalStoragePreference
   * use for grafana versions less than 11.5.0
   */
  const [userLocalStoragePreference, setUserLocalStoragePreference] = useSavedState<string>({
    key: `volkovlabs.table.panel.${id}.user.preferences`,
    initialValue: '',
  });

  /**
   * User Preference
   */
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});

  /**
   * Storage
   * use for grafana versions gte 11.5.0
   */
  const userStorage = useRef<PluginUserStorage | null>(null);

  /**
   * Avoid plugin crush for grafana versions lt 11.5.0
   */
  try {
    const storage = usePluginUserStorage();

    if (!userStorage.current) {
      userStorage.current = storage;
    }
  } catch {}

  useEffect(() => {
    if (
      options.isColumnMangerAvailable &&
      options.saveUserPreference &&
      semver.gte(config.buildInfo.version, '11.5.0') &&
      userStorage.current
    ) {
      userStorage.current.getItem(`volkovlabs.table.panel.${id}.user.preferences`).then((value: string | null) => {
        if (value) {
          setUserPreferences(JSON.parse(value));
        }
      });
    }

    /**
     * Load once
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      options.isColumnMangerAvailable &&
      options.saveUserPreference &&
      semver.lt(config.buildInfo.version, '11.5.0') &&
      isEmpty(userPreferences) &&
      !!userLocalStoragePreference
    ) {
      setUserPreferences(JSON.parse(userLocalStoragePreference));
    }
  }, [options.isColumnMangerAvailable, options.saveUserPreference, userLocalStoragePreference, userPreferences]);

  /**
   * Save user storage with preferences
   */
  const setStorage = useCallback(
    (preferences: UserPreferences) => {
      /**
       * Use for grafana gte 11.5.0
       */
      if (semver.gte(config.buildInfo.version, '11.5.0') && userStorage.current) {
        userStorage.current.setItem(`volkovlabs.table.panel.${id}.user.preferences`, JSON.stringify(preferences));

        return;
      }

      /**
       * Use for grafana lt 11.5.0
       */
      setUserLocalStoragePreference(JSON.stringify(preferences));
    },
    [id, setUserLocalStoragePreference]
  );

  /**
   * Save Table preferences
   */
  const updateTablesPreferences = useCallback(
    (tableName: string, updatedColumns: ColumnItem[]) => {
      const updatedTables =
        userPreferences.tables && !!userPreferences.tables.length ? [...userPreferences.tables] : [];

      const tableIndex = updatedTables.findIndex((table) => table.name === tableName);

      if (tableIndex === -1) {
        updatedTables.push({ name: tableName, columns: updatedColumns });
      } else {
        updatedTables[tableIndex] = {
          ...updatedTables[tableIndex],
          columns: updatedColumns,
        };
      }

      setUserPreferences({ ...userPreferences, tables: updatedTables });
      if (options.saveUserPreference) {
        setStorage({ ...userPreferences, tables: updatedTables });
      }
    },
    [options.saveUserPreference, setStorage, userPreferences]
  );

  const clearPreferences = useCallback(() => {
    setUserPreferences({});
    if (options.saveUserPreference) {
      setStorage({});
    }
  }, [options.saveUserPreference, setStorage]);

  return {
    currentGroup,
    setCurrentGroup,
    setStorage,
    userPreferences,
    updateTablesPreferences,
    clearPreferences,
  };
};
