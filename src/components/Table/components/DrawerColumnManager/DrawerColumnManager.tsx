import { cx } from '@emotion/css';
import { Icon, IconButton, Tag, Tooltip, useStyles2 } from '@grafana/ui';
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from '@hello-pangea/dnd';
import { HeaderGroup, SortingState } from '@tanstack/react-table';
import React, { useCallback } from 'react';

import { TEST_IDS } from '@/constants';
import {
  AdvancedSettings,
  ColumnConfig,
  ColumnFilterValue,
  ColumnPinDirection,
  TablePreferenceColumn,
  UserPreferences,
} from '@/types';
import { getFieldKey, prepareColumnConfigsForPreferences, prepareColumnsWithSorting, reorder } from '@/utils';

import { FilterDrawer } from '../FilterDrawer';
import { getStyles } from './DrawerColumnManager.styles';

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Mixed Columns for drawer
   */
  drawerColumns?: ColumnConfig[];

  /**
   * Headers
   */
  headers: Array<HeaderGroup<TData>>;

  /**
   * update Tables Preferences
   */
  updateTablesPreferences: (tableName: string, updatedColumns: TablePreferenceColumn[]) => void;

  /**
   * Table Name
   */
  currentTableName: string;

  /**
   * User Preferences
   */
  userPreferences: UserPreferences;

  /**
   * Advanced options
   */
  advancedSettings: AdvancedSettings;

  /**
   * Sorting state
   */
  sorting: SortingState;
}

/**
 * Get Item Style
 */
const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
  /**
   * styles we need to apply on draggables
   */
  ...draggableStyle,
});

/**
 * Test Ids
 */
const testIds = TEST_IDS.drawerColumnManager;

/**
 * Drawer Column Manager
 */
export const DrawerColumnManager = <TData,>({
  drawerColumns,
  headers,
  updateTablesPreferences,
  currentTableName,
  userPreferences,
  advancedSettings,
  sorting,
}: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      /**
       * Dropped outside the list
       */
      if (!result.destination || !drawerColumns) {
        return;
      }

      /**
       * Reorder Items
       */
      const reorderItems = reorder(drawerColumns, result.source.index, result.destination.index);

      /**
       * Transform columns to preferences
       */
      const transformedColumns = prepareColumnConfigsForPreferences(reorderItems, currentTableName, userPreferences);

      updateTablesPreferences(currentTableName, transformedColumns);
    },
    [currentTableName, drawerColumns, updateTablesPreferences, userPreferences]
  );

  /**
   * Update Preferences with filters
   */
  const updatePreferencesWithFilters = useCallback(
    (columnName: string, filterValue?: ColumnFilterValue) => {
      /**
       * Saved Table
       */
      const preferencesTables = userPreferences.tables?.length ? userPreferences.tables : [];
      const savedTable = preferencesTables.find((table) => table.name === currentTableName);

      let updatedItems = [];
      if (!savedTable || (savedTable && !savedTable.columns.length)) {
        /**
         * Transform columns to preferences
         */
        const transformedColumns = prepareColumnConfigsForPreferences(
          drawerColumns!,
          currentTableName,
          userPreferences
        );

        /**
         * Items with filters
         */
        updatedItems = transformedColumns.map((column) =>
          column.name === columnName ? { ...column, filter: filterValue } : column
        );
      } else {
        updatedItems = savedTable.columns.map((column) =>
          column.name === columnName ? { ...column, filter: filterValue } : column
        );
      }

      updateTablesPreferences(currentTableName, updatedItems);
    },
    [currentTableName, drawerColumns, updateTablesPreferences, userPreferences]
  );

  return (
    <div {...testIds.root.apply()}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="DrawerColumnManager">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {drawerColumns?.map((item, index) => {
                const header = headers
                  .find((header) => {
                    return header.headers.some((headerItem) => {
                      return headerItem.id === item.field.name;
                    });
                  })
                  ?.headers.find((headerItem) => headerItem.id === item.field.name);

                const sort = header?.column.getIsSorted();
                const sortIsEnabled = header?.column.getCanSort() && advancedSettings.showSortInColumnManager;

                return (
                  <Draggable key={getFieldKey(item.field)} draggableId={getFieldKey(item.field)} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        className={styles.item}
                      >
                        <div className={styles.drawerColumnItem} {...testIds.columnItem.apply(item.field.name)}>
                          <div className={styles.itemControls}>
                            <div className={styles.dragHandle} {...provided.dragHandleProps}>
                              <Icon
                                title="Drag and drop to reorder"
                                name="draggabledots"
                                size="lg"
                                className={styles.dragIcon}
                              />
                            </div>
                            <IconButton
                              name={item.enabled ? 'eye' : 'eye-slash'}
                              aria-label={item.enabled ? 'Hide' : 'Show'}
                              onClick={() => {
                                /**
                                 * Update column
                                 */
                                const updatedColumns = drawerColumns.map((column) =>
                                  column.field === item.field
                                    ? {
                                        ...item,
                                        enabled: !item.enabled,
                                      }
                                    : column
                                );

                                /**
                                 * Transform columns to preferences
                                 */
                                const transformedColumns = prepareColumnConfigsForPreferences(
                                  updatedColumns,
                                  currentTableName,
                                  userPreferences
                                );

                                updateTablesPreferences(currentTableName, transformedColumns);
                              }}
                              tooltip={item.enabled ? 'Hide' : 'Show'}
                              {...testIds.buttonToggleVisibility.apply(item.field.name)}
                            />
                            {sortIsEnabled && !sort && (
                              <Tooltip
                                content="Sorting is available"
                                {...testIds.iconSortingAvailable.apply(item.field.name)}
                              >
                                <div className={styles.sortTag}>
                                  <Icon name="arrows-v" size="sm" />
                                </div>
                              </Tooltip>
                            )}
                            <div
                              onClick={(event) => {
                                if (!sortIsEnabled) {
                                  return;
                                }
                                /**
                                 * Updated column items include sorting
                                 */
                                const updatedColumns = prepareColumnsWithSorting(
                                  drawerColumns,
                                  item.field.name,
                                  sorting
                                );

                                /**
                                 * Transform columns to preferences columns
                                 */
                                const transformedColumns = prepareColumnConfigsForPreferences(
                                  updatedColumns,
                                  currentTableName,
                                  userPreferences
                                );

                                /**
                                 * define sortHandler
                                 */
                                const sortHandler = header?.column.getToggleSortingHandler();

                                if (sortHandler) {
                                  sortHandler(event);
                                }

                                /**
                                 * update Preferences
                                 */
                                updateTablesPreferences(currentTableName, transformedColumns);
                              }}
                              className={cx({
                                [styles.labelSortable]: header?.column.getCanSort(),
                                [styles.itemName]: true,
                              })}
                              {...testIds.nameContainer.apply(item.field.name)}
                            >
                              {item.field.name} {item.label && `[${item.label}]`}
                              {!!sort && sortIsEnabled && (
                                <Icon
                                  name={sort === 'asc' ? 'arrow-up' : 'arrow-down'}
                                  size="lg"
                                  {...testIds.iconSort.apply(
                                    `${item.field.name}-${sort === 'asc' ? 'arrow-up' : 'arrow-down'}`
                                  )}
                                />
                              )}
                            </div>
                            {item.pin === ColumnPinDirection.LEFT && <Tag name="Pinned: Left" />}
                            {item.pin === ColumnPinDirection.RIGHT && <Tag name="Pinned: Right" />}
                          </div>
                          {item.filter.enabled && header && advancedSettings.showFiltersInColumnManager && (
                            <div className={styles.filterDrawer} {...testIds.columnItemFilter.apply(item.field.name)}>
                              <FilterDrawer
                                header={header}
                                updatePreferencesWithFilters={(columnName, filter) =>
                                  updatePreferencesWithFilters(columnName, filter)
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
