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
  ColumnPinDirection,
  ColumnSortConfig,
  EditPermissionMode,
  PaginationMode,
  PanelOptions,
  TableConfig,
  TablePaginationConfig,
  TableRequestConfig,
} from './types';

/**
 * Outdated Column Config
 */
interface OutdatedColumnConfig extends Omit<ColumnConfig, 'filter' | 'sort' | 'appearance' | 'edit' | 'pin'> {
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

  /**
   * Pin
   *
   * Introduced in 1.3.0
   */
  pin?: boolean | ColumnPinDirection;
}

/**
 * Outdated Group
 */
interface OutdatedGroup extends Omit<TableConfig, 'items' | 'update' | 'pagination'> {
  items: OutdatedColumnConfig[];

  /**
   * Update
   *
   * Introduced in 1.3.0
   */
  update?: TableRequestConfig;

  /**
   * Pagination
   *
   * Introduced in 1.3.0
   */
  pagination?: TablePaginationConfig;
}

/**
 * Outdated Toolbar Options
 */
interface OutdatedToolbarOptions {
  /**
   * Export
   *
   * Introduced in 1.3.0
   */
  export?: boolean;
}

/**
 * Outdated Panel Options
 */
interface OutdatedPanelOptions extends Omit<PanelOptions, 'groups' | 'tabsSorting' | 'toolbar'> {
  /**
   * Groups
   *
   * Renamed in 1.1.0
   */
  groups?: OutdatedGroup[];

  /**
   * Tabs Sorting
   *
   * Introduced in 1.1.0
   */
  tabsSorting?: boolean;

  /**
   * Toolbar
   *
   * Introduced in 1.3.0
   */
  toolbar?: OutdatedToolbarOptions;
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
            sortDescFirst: false,
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

        /**
         * Normalize pin
         */
        if (normalized.pin === undefined) {
          normalized.pin = ColumnPinDirection.NONE;
        } else if (typeof (normalized.pin as never) === 'boolean') {
          normalized.pin = normalized.pin ? ColumnPinDirection.LEFT : ColumnPinDirection.NONE;
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

      /**
       * Normalize Pagination
       */
      if (!normalizedGroup.pagination) {
        normalizedGroup.pagination = {
          enabled: false,
          mode: PaginationMode.CLIENT,
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

  /**
   * Normalize toolbar
   */
  if (!options.toolbar) {
    options.toolbar = {};
  }

  if (options.toolbar.export === undefined) {
    options.toolbar.export = false;
  }

  return options as PanelOptions;
};
