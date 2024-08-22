import { PanelModel } from '@grafana/data';

import {
  ColumnConfig,
  ColumnFilterConfig,
  ColumnFilterMode,
  ColumnSortConfig,
  PanelOptions,
  TableConfig,
} from './types';

/**
 * Outdated Column Config
 */
interface OutdatedColumnConfig extends Omit<ColumnConfig, 'filter' | 'sort'> {
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
}

/**
 * Outdated Group
 */
interface OutdatedGroup extends Omit<TableConfig, 'items'> {
  items: OutdatedColumnConfig[];
}

/**
 * Outdated Panel Options
 */
interface OutdatedPanelOptions extends Omit<PanelOptions, 'groups'> {
  /**
   * Groups
   *
   * Renamed in v1.1.0
   */
  groups?: OutdatedGroup[];
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
  if (options.groups) {
    options.tables = options.groups.map((group) => {
      return {
        ...group,
        items: group.items.map((columnConfig) => {
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

          return normalized;
        }),
      };
    });

    delete options.groups;
  }

  return options as PanelOptions;
};
