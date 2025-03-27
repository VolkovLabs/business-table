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
