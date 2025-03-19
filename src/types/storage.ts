export interface PluginUserStorage {
  /**
   * Retrieves an item from the backend user storage or local storage if not enabled.
   * @param key - The key of the item to retrieve.
   * @returns A promise that resolves to the item value or null if not found.
   */
  getItem(key: string): Promise<string | null>;
  /**
   * Sets an item in the backend user storage or local storage if not enabled.
   * @param key - The key of the item to set.
   * @param value - The value of the item to set.
   * @returns A promise that resolves when the item is set.
   */
  setItem(key: string, value: string): Promise<void>;
}

/**
 * Table Preference Column
 */
export interface TablePreferenceColumn {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled?: boolean;

  /**
   * Filter
   *
   * @type {unknown}
   */
  filter?: unknown;
}

/**
 * Saved Table Item
 */
export interface SavedTableItem {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Columns
   *
   * @type {TableColumn[]}
   */
  columns: TablePreferenceColumn[];
}

/**
 * User Preferences
 */
export interface UserPreferences {
  /**
   * Current Group
   *
   * @type {string}
   */
  currentGroup?: string;

  /**
   * Tables
   *
   * @type {SavedTableItem[]}
   */
  tables?: SavedTableItem[];

  /**
   * Options
   *
   * @type {Record<string, string>}
   */
  options?: Record<string, string>;
}
