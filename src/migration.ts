import { DataSourceApi, PanelModel } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import semver from 'semver';

import { getColumnEditorConfig } from '@/utils';

import {
  ColumnAlignment,
  ColumnAppearanceConfig,
  ColumnConfig,
  ColumnEditConfig,
  ColumnEditorType,
  ColumnFilterConfig,
  ColumnFilterMode,
  ColumnHeaderFontSize,
  ColumnPinDirection,
  ColumnSortConfig,
  ImageScale,
  NestedObjectConfig,
  PaginationMode,
  PanelOptions,
  PermissionMode,
  TableConfig,
  TablePaginationConfig,
  TableRequestConfig,
} from './types';

/**
 * Outdated Column Config
 */
interface OutdatedColumnConfig
  extends Omit<ColumnConfig, 'filter' | 'sort' | 'appearance' | 'edit' | 'pin' | 'enabled'> {
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

  /**
   * Enabled
   *
   * Introduced in 1.4.0
   */
  enabled?: boolean;
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
interface OutdatedPanelOptions extends Omit<PanelOptions, 'groups' | 'tabsSorting' | 'toolbar' | 'nestedObjects'> {
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

  /**
   * Nested Objects
   *
   * Introduced in 1.4.0
   */
  nestedObjects?: NestedObjectConfig[];
}

/**
 * Fetch datasources
 */
const fetchData = async () => {
  return await getBackendSrv().get('/api/datasources');
};

/**
 * Normalize datasource option
 *
 * @param obj
 * @param name
 *
 */
const normalizeDatasourceOptions = (ds: DataSourceApi[], name?: string): string => {
  const currentDs = ds.find((element) => element.name === name);
  return currentDs?.uid || '';
};

/**
 * Get Migrated Options
 * @param panel
 */
export const getMigratedOptions = async (panel: PanelModel<OutdatedPanelOptions>): Promise<PanelOptions> => {
  const { ...options } = panel.options;

  const dataSources: DataSourceApi[] = await fetchData();
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
            descFirst: false,
            enabled: false,
          };
        }

        /**
         * Add sortDescFirst option if missed
         */
        if (normalized.sort.descFirst === undefined) {
          normalized.sort = {
            ...normalized.sort,
            descFirst: false,
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
          header: {
            fontSize: ColumnHeaderFontSize.MD,
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
              mode: PermissionMode.ALLOWED,
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

        /**
         * Normalize enabled
         */
        if (normalized.enabled === undefined) {
          normalized.enabled = true;
        }

        if (
          panel.pluginVersion &&
          semver.lt(panel.pluginVersion, '1.8.0') &&
          normalized.edit?.editor?.type === ColumnEditorType.SELECT &&
          !normalized.edit.editor.hasOwnProperty('customValues')
        ) {
          normalized.edit = {
            ...normalized.edit,
            editor: {
              ...normalized.edit.editor,
              customValues: false,
            },
          };
        }

        /**
         * Normalize scale fot items
         */
        if (panel.pluginVersion && semver.lt(panel.pluginVersion, '1.9.0') && !normalized.hasOwnProperty('scale')) {
          normalized.scale = ImageScale.AUTO;
        }

        return normalized;
      });

      const normalizedGroup = {
        ...group,
        items: columns,
      } as TableConfig;

      if (!normalizedGroup.hasOwnProperty('showHeader')) {
        normalizedGroup.showHeader = true;
      }

      /**
       * Normalize update request
       */
      if (!normalizedGroup.update) {
        normalizedGroup.update = {
          datasource: '',
          payload: {},
        };
      }

      if (!normalizedGroup.hasOwnProperty('expanded')) {
        normalizedGroup.expanded = false;
      }

      if (panel.pluginVersion && semver.lt(panel.pluginVersion, '1.7.0') && !!normalizedGroup.update.datasource) {
        normalizedGroup.update = {
          ...normalizedGroup.update,
          datasource: normalizeDatasourceOptions(dataSources, normalizedGroup.update.datasource),
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
   * Normalize Tabs Sorting
   */
  if (options.tabsSorting === undefined) {
    options.tabsSorting = false;
  }

  /**
   * Normalize Toolbar
   */
  if (!options.toolbar) {
    options.toolbar = {};
  }

  if (options.toolbar.export === undefined) {
    options.toolbar.export = false;
  }

  /**
   * Normalize Nested Objects
   */
  if (!options.nestedObjects) {
    options.nestedObjects = [];
  }

  if (panel.pluginVersion && semver.lt(panel.pluginVersion, '1.7.0') && !!options.nestedObjects.length) {
    const nestedObjectsUpdated = options.nestedObjects.map((nestedObject) => {
      const object = { ...nestedObject };
      if (nestedObject.add && nestedObject.add?.request.datasource) {
        object.add = {
          ...nestedObject.add,
          request: {
            ...nestedObject.add?.request,
            datasource: normalizeDatasourceOptions(dataSources, nestedObject.add?.request.datasource),
          },
        };
      }

      if (nestedObject.delete && nestedObject.delete?.request.datasource) {
        object.delete = {
          ...nestedObject.delete,
          request: {
            ...nestedObject.delete?.request,
            datasource: normalizeDatasourceOptions(dataSources, nestedObject.delete?.request.datasource),
          },
        };
      }

      if (nestedObject.get) {
        object.get = {
          ...nestedObject.get,
          datasource: normalizeDatasourceOptions(dataSources, nestedObject.get.datasource),
        };
      }

      return object;
    });

    options.nestedObjects = nestedObjectsUpdated;
  }
  return options as PanelOptions;
};
