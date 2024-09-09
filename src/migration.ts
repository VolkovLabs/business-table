import { PanelModel } from '@grafana/data';

import { getColumnEditorConfig } from '@/utils';

import {
  ColumnAlignment,
  ColumnAppearanceConfig,
  ColumnConfig,
  ColumnEditConfig,
  ColumnEditorType,
  ColumnFilterConfig,
  ColumnFilterMode,
  ColumnSortConfig,
  EditPermissionMode,
  PanelOptions,
  TableConfig,
  TableRequestConfig,
} from './types';

/**
 * Outdated Column Config
 */
interface OutdatedColumnConfig extends Omit<ColumnConfig, 'filter' | 'sort' | 'appearance' | 'edit'> {
  /**
   * Filter
   *
   * Introduced in 1.1.0
   */
  filter?: ColumnFilterConfig;

  /**
   * Filter
   *
   * Introduced in 1.1.0
   */
  sort?: ColumnSortConfig;

  /**
   * Appearance
   *
   * Introduced in 1.2.0
   */
  appearance?: ColumnAppearanceConfig;

  /**
   * Edit
   *
   * Introduced in 1.3.0
   */
  edit?: ColumnEditConfig;
}

/**
 * Outdated Group
 */
interface OutdatedGroup extends Omit<TableConfig, 'items' | 'update'> {
  items: OutdatedColumnConfig[];

  /**
   * Update
   *
   * Introduced in 1.3.0
   */
  update?: TableRequestConfig;
}

/**
 * Outdated Panel Options
 */
interface OutdatedPanelOptions extends Omit<PanelOptions, 'groups' | 'tabsSorting'> {
  /**
   * Groups
   *
   * Renamed in v1.1.0
   */
  groups?: OutdatedGroup[];

  /**
   * Tabs Sorting
   *
   * Introduced in v1.1.0
   */
  tabsSorting?: boolean;
}

/**
 * Get Migrated Options
 * @param panel
 */
export const getMigratedOptions = (panel: PanelModel<OutdatedPanelOptions>): PanelOptions => {
  const { ...options } = panel.options;

  /**
   * Normalize groups
   */
  if (options.groups || options.tables) {
    const items = options.groups || options.tables;
    options.tables = items.map((group) => {
      const columns = group.items.map((columnConfig) => {
        const normalized = columnConfig as ColumnConfig;

        /**
         * Add filter options
         */
        if (!normalized.filter) {
          normalized.filter = {
            enabled: false,
            mode: ColumnFilterMode.CLIENT,
            variable: '',
          };
        }

        /**
         * Add sort options
         */
        if (!normalized.sort) {
          normalized.sort = {
            enabled: false,
          };
        }

        /**
         * Add appearance options
         */
        normalized.appearance = {
          width: {
            auto: true,
            value: 100,
          },
          background: {
            applyToRow: false,
          },
          wrap: true,
          alignment: ColumnAlignment.START,
          ...(normalized.appearance as Partial<ColumnAppearanceConfig>),
        };

        /**
         * Normalize footer
         */
        if (!normalized.footer) {
          normalized.footer = [];
        }

        /**
         * Normalize edit
         */
        if (!normalized.edit) {
          normalized.edit = {
            enabled: false,
            permission: {
              mode: EditPermissionMode.ALLOWED,
              field: {
                source: '',
                name: '',
              },
              userRole: [],
            },
            editor: getColumnEditorConfig(ColumnEditorType.STRING),
          };
        }

        return normalized;
      });

      const normalizedGroup = {
        ...group,
        items: columns,
      } as TableConfig;

      /**
       * Normalize update request
       */
      if (!normalizedGroup.update) {
        normalizedGroup.update = {
          datasource: '',
          payload: {},
        };
      }

      return normalizedGroup;
    });

    delete options.groups;
  }

  /**
   * Normalize tabs sorting
   */
  if (options.tabsSorting === undefined) {
    options.tabsSorting = false;
  }

  return options as PanelOptions;
};
