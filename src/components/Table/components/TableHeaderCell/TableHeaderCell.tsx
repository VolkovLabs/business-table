import { cx } from '@emotion/css';
import { Icon, IconButton, Tooltip, useStyles2, useTheme2 } from '@grafana/ui';
import { flexRender, Header, SortingState } from '@tanstack/react-table';
import React, { useCallback, useMemo } from 'react';

import { ACTIONS_COLUMN_ID, TEST_IDS } from '@/constants';
import {
  AdvancedSettings,
  ColumnConfig,
  ColumnFilterValue,
  ColumnHeaderFontSize,
  TablePreferenceColumn,
  UserPreferences,
} from '@/types';
import { prepareColumnConfigsForPreferences, prepareColumnsWithFilters, prepareColumnsWithSorting } from '@/utils';

import { getStyles } from './TableHeaderCell.styles';
import { TableHeaderCellFilter } from './TableHeaderCellFilter';

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Header
   */
  header: Header<TData, unknown>;

  /**
   * Size
   *
   * @type {ColumnHeaderFontSize}
   */
  size: ColumnHeaderFontSize;

  /**
   * Is Add Row Enabled
   *
   * @type {boolean}
   */
  isAddRowEnabled: boolean;

  /**
   * Add Row
   */
  onAddRow: () => void;

  /**
   * Open drawer set state
   */
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * Advanced options
   */
  advancedSettings: AdvancedSettings;

  /**
   * update Tables Preferences
   */
  updateTablesPreferences: (tableName: string, updatedColumns: TablePreferenceColumn[]) => void;

  /**
   * Sorting state
   */
  sorting: SortingState;

  /**
   * Mixed Columns for drawer
   */
  drawerColumns?: ColumnConfig[];

  /**
   * Table Name
   */
  currentTableName: string;

  /**
   * User Preferences
   */
  userPreferences: UserPreferences;
}

/**
 * Test Ids
 */
export const testIds = TEST_IDS.tableHeaderCell;

/**
 * Table Header Cell
 */
export const TableHeaderCell = <TData,>({
  header,
  size,
  isAddRowEnabled,
  onAddRow,
  advancedSettings,
  setDrawerOpen,
  updateTablesPreferences,
  sorting,
  drawerColumns,
  currentTableName,
  userPreferences,
}: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);
  const theme = useTheme2();
  const sortIsEnabled = header.column.getCanSort();
  const sort = header.column.getIsSorted();
  const fontColor = header.column.columnDef.meta?.config.appearance.header.fontColor || 'inherit';
  const tooltip = useMemo(
    () => header.column.columnDef.meta?.config.columnTooltip,
    [header.column.columnDef.meta?.config.columnTooltip]
  );

  const isAllSettingsUseInManager = useMemo(() => {
    return (
      advancedSettings?.isColumnManagerAvailable &&
      advancedSettings?.showFiltersInColumnManager &&
      advancedSettings?.showSortInColumnManager &&
      header.column.columnDef.enableColumnFilter &&
      header.column.columnDef.enableSorting
    );
  }, [
    advancedSettings?.isColumnManagerAvailable,
    advancedSettings?.showFiltersInColumnManager,
    advancedSettings?.showSortInColumnManager,
    header.column.columnDef.enableColumnFilter,
    header.column.columnDef.enableSorting,
  ]);

  /**
   * Update Preferences with filters
   */
  const updatePreferencesWithFilters = useCallback(
    (columnName: string, filterValue?: ColumnFilterValue) => {
      /**
       * Prepare Preferences with filters
       */
      const updatedItems = prepareColumnsWithFilters(
        userPreferences,
        currentTableName,
        drawerColumns,
        columnName,
        filterValue
      );

      updateTablesPreferences(currentTableName, updatedItems);
    },
    [currentTableName, drawerColumns, updateTablesPreferences, userPreferences]
  );

  /**
   * Actions Header
   */
  if (header.column.id === ACTIONS_COLUMN_ID) {
    return (
      <div className={styles.actions}>
        {isAddRowEnabled && (
          <IconButton
            name="plus"
            size={size}
            aria-label="Add Row"
            onClick={onAddRow}
            {...testIds.buttonAddRow.apply()}
          />
        )}
        <p {...testIds.actionHeaderText.apply()} className={styles.actionHeader}>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </p>
      </div>
    );
  }

  const renderFilterIcon = () => {
    if (header.column.columnDef.enableColumnFilter) {
      if (advancedSettings.isColumnManagerAvailable && advancedSettings.showFiltersInColumnManager) {
        return (
          <button
            onClick={() => setDrawerOpen(true)}
            className={styles.filterButton}
            {...TEST_IDS.tableHeaderCellFilter.root.apply()}
          >
            <Icon
              name="filter"
              size={size}
              style={{
                color: header.column.getIsFiltered() ? theme.colors.primary.text : theme.colors.secondary.text,
              }}
            />
          </button>
        );
      }

      return (
        <TableHeaderCellFilter
          header={header}
          size={size}
          updatePreferencesWithFilters={(columnName, filter) => updatePreferencesWithFilters(columnName, filter)}
          saveUserPreference={advancedSettings.saveUserPreference}
        />
      );
    }

    return null;
  };

  return (
    <>
      {isAllSettingsUseInManager && (
        <Tooltip
          content={'Sorting and filtering are available in the column manager. Click to open it.'}
          interactive
          {...testIds.tooltipColumnManager.apply()}
        >
          <IconButton
            name="sliders-v-alt"
            size="xs"
            aria-label="Sort and filters"
            onClick={() => {
              setDrawerOpen(true);
            }}
            {...testIds.buttonOpenColumnManager.apply()}
          />
        </Tooltip>
      )}
      <div
        onClick={(event) => {
          /**
           * If sorting is disabled, no actions should be invoked.
           */
          if (!header.column.columnDef.enableSorting) {
            return;
          }

          /**
           * Open drawer if sorting and UI manager are available
           */
          if (advancedSettings.isColumnManagerAvailable && advancedSettings.showSortInColumnManager) {
            setDrawerOpen(true);
            return;
          }

          /**
           * Define sortHandler
           */
          const sortHandler = header.column.getToggleSortingHandler();

          if (sortHandler) {
            sortHandler(event);
          }

          /**
           * Add ability to use user preferences without UI manager
           */
          if (advancedSettings.saveUserPreference) {
            /**
             * Updated column items include sorting
             */
            const updatedColumns = prepareColumnsWithSorting(drawerColumns ?? [], header.column.id, sorting);

            /**
             * Transform columns to preferences columns
             */
            const transformedColumns = prepareColumnConfigsForPreferences(
              updatedColumns,
              currentTableName,
              userPreferences
            );

            /**
             * update Preferences
             */
            updateTablesPreferences(currentTableName, transformedColumns);
          }
        }}
        className={cx({
          [styles.labelSortable]: header.column.getCanSort(),
        })}
        style={{
          color: fontColor,
        }}
        {...testIds.root.apply()}
      >
        {!!tooltip && (
          <Tooltip content={tooltip} {...testIds.tooltip.apply()}>
            <Icon name="exclamation-circle" size="xs" aria-label="Info message" className={styles.tooltip} />
          </Tooltip>
        )}
        {!isAllSettingsUseInManager && sortIsEnabled && !sort && (
          <Tooltip content="Sorting is available" {...testIds.tooltipIconSortAvailable.apply()}>
            <Icon name="arrows-v" size="xs" aria-label="Info message" className={styles.sortingAvailable} />
          </Tooltip>
        )}
        {flexRender(header.column.columnDef.header, header.getContext())}
        {!isAllSettingsUseInManager && !!sort && (
          <Icon
            key={sort}
            name={sort === 'asc' ? 'arrow-up' : 'arrow-down'}
            size={size}
            {...testIds.sortIcon.apply(sort === 'asc' ? 'arrow-up' : 'arrow-down')}
          />
        )}
      </div>
      {!isAllSettingsUseInManager && renderFilterIcon()}
    </>
  );
};
