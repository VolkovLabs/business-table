import {
  DataFrame,
  dateTime,
  Field,
  fieldReducers,
  FieldType,
  formattedValueToString,
  getDisplayProcessor,
  GrafanaTheme2,
  reduceField,
  toDataFrame,
  TypedVariableModel,
} from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import {
  ColumnDef,
  ColumnFilter,
  ColumnFiltersState,
  filterFns,
  FilterMeta,
  HeaderContext,
  Row,
  SortingState,
  Table as TableInstance,
} from '@tanstack/react-table';
import { get } from 'lodash';

import { ROW_HIGHLIGHT_STATE_KEY } from '@/constants';
import {
  ColumnConfig,
  ColumnFilterMode,
  ColumnFilterType,
  ColumnFilterValue,
  NumberFilterOperator,
  TableConfig,
  TablePreferenceColumn,
  UserPreferences,
} from '@/types';

/**
 * Identify Filter
 */
const identifyFilter = (filterValue: unknown): ColumnFilterValue => {
  if (filterValue && typeof filterValue === 'object' && 'type' in filterValue) {
    if (Object.values(ColumnFilterType).includes(filterValue.type as never)) {
      return filterValue as ColumnFilterValue;
    }
  }

  return {
    type: 'none',
  };
};

/**
 * Apply Number Filter
 * @param row
 * @param columnId
 * @param filterValue
 * @param operator
 */
const numberFilter = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: [number, number],
  operator: NumberFilterOperator
): boolean => {
  const value = row.getValue(columnId) as number;
  const compareValue = filterValue[0];

  switch (operator) {
    case NumberFilterOperator.BETWEEN: {
      const from = Math.min(filterValue[0], filterValue[1]);
      const to = Math.max(filterValue[0], filterValue[1]);

      return value >= from && value <= to;
    }
    case NumberFilterOperator.MORE: {
      return value > compareValue;
    }
    case NumberFilterOperator.MORE_OR_EQUAL: {
      return value >= compareValue;
    }
    case NumberFilterOperator.LESS: {
      return value < compareValue;
    }
    case NumberFilterOperator.LESS_OR_EQUAL: {
      return value <= compareValue;
    }
    case NumberFilterOperator.EQUAL: {
      return value === compareValue;
    }
    case NumberFilterOperator.NOT_EQUAL: {
      return value !== compareValue;
    }
    default: {
      return false;
    }
  }
};

/**
 * Apply Timestamp Filter
 * @param row
 * @param columnId
 * @param filterValue
 */
const timestampFilter = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: { from: number; to: number }
): boolean => {
  const value = row.getValue(columnId);

  /**
   * Invalid value so not to filter
   */
  if (typeof value !== 'number' && typeof value !== 'string') {
    return true;
  }

  /**
   * Value is a timestamp
   */
  if (typeof value === 'number') {
    return value >= filterValue.from && value <= filterValue.to;
  }

  /**
   * Normalize if valid string date
   */
  const date = dateTime(value);

  /**
   * Valid date string
   */
  if (date.isValid()) {
    const numberValue = date.valueOf();
    return numberValue >= filterValue.from && numberValue <= filterValue.to;
  }

  /**
   * Invalid date string so not to filter
   */
  return true;
};

/**
 * Apply Faceted Filter
 * @param row
 * @param columnId
 * @param filterValue
 */
const facetedFilter = <TData>(row: Row<TData>, columnId: string, filterValue: unknown[]) => {
  return filterValue.some((val) => row.getValue<unknown[]>(columnId) === val);
};

/**
 * Column Filter
 */
export const columnFilter = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown,
  addMeta: (meta: FilterMeta) => void
): boolean => {
  const filter = identifyFilter(filterValue);

  switch (filter.type) {
    case ColumnFilterType.SEARCH: {
      if (filter.caseSensitive) {
        return filterFns.includesStringSensitive(row, columnId, filter.value, addMeta);
      }

      return filterFns.includesString(row, columnId, filter.value, addMeta);
    }
    case ColumnFilterType.NUMBER: {
      return numberFilter(row, columnId, filter.value, filter.operator);
    }
    case ColumnFilterType.FACETED: {
      return facetedFilter(row, columnId, filter.value);
    }
    case ColumnFilterType.TIMESTAMP: {
      /**
       * Filter value should be resolved by resolveFilterValue
       */
      return timestampFilter(row, columnId, filter.valueToFilter!);
    }
    default: {
      return true;
    }
  }
};

/**
 * Normalize Filter Value once before start filtering
 * @param filter
 */
columnFilter.resolveFilterValue = (filter: ColumnFilterValue) => {
  if (filter.type === ColumnFilterType.TIMESTAMP) {
    return {
      ...filter,
      valueToFilter: {
        from: filter.value.from.valueOf(),
        to: filter.value.to.valueOf(),
      },
    };
  }

  return filter;
};

/**
 * Get Filter with new type
 */
export const getFilterWithNewType = (type: ColumnFilterType | 'none'): ColumnFilterValue => {
  switch (type) {
    case ColumnFilterType.NUMBER: {
      return {
        type,
        value: [0, 0],
        operator: NumberFilterOperator.MORE,
      };
    }
    case ColumnFilterType.SEARCH: {
      return {
        type,
        value: '',
        caseSensitive: false,
      };
    }
    case ColumnFilterType.FACETED: {
      return {
        type,
        value: [],
      };
    }
    case ColumnFilterType.TIMESTAMP: {
      const from = dateTime(null);
      const to = dateTime(null);

      return {
        type,
        value: {
          from,
          to,
          raw: {
            from,
            to,
          },
        },
      };
    }

    default: {
      return {
        type,
      };
    }
  }
};

/**
 * Get Supported Filter Types For Variable
 * @param variable
 */
export const getSupportedFilterTypesForVariable = (variable: TypedVariableModel): ColumnFilterType[] => {
  if (variable) {
    switch (variable.type) {
      case 'query':
      case 'custom': {
        if (variable.multi) {
          return [ColumnFilterType.FACETED];
        }
        break;
      }
      case 'textbox':
      case 'constant': {
        return [ColumnFilterType.SEARCH];
      }
    }
  }

  return [];
};

/**
 * Get Column Filters based on variables
 * @param columns
 */
export const getVariableColumnFilters = <TData>(
  columns: Array<ColumnDef<TData>>
): Array<{ id: string; value: ColumnFilterValue | undefined }> => {
  const columnsToSync = columns.filter(
    (column) => column.enableColumnFilter && column.meta?.filterMode === ColumnFilterMode.QUERY
  );

  if (columnsToSync.length) {
    const variables = getTemplateSrv().getVariables();
    const columnFilters: Array<{ id: string; value: ColumnFilterValue | undefined }> = [];

    columnsToSync.forEach((column) => {
      const variable = variables.find((variable) => variable.name === column.meta?.filterVariableName);

      if (variable) {
        const currentValue = 'current' in variable ? variable.current.value : '';
        const supportedFilterTypes = getSupportedFilterTypesForVariable(variable);
        const filterType = supportedFilterTypes[0];

        if (filterType && currentValue) {
          switch (filterType) {
            case ColumnFilterType.SEARCH: {
              columnFilters.push({
                id: column.id!,
                value: {
                  type: ColumnFilterType.SEARCH,
                  value: currentValue as string,
                  caseSensitive: false,
                },
              });
              break;
            }
            case ColumnFilterType.FACETED: {
              columnFilters.push({
                id: column.id!,
                value: {
                  type: ColumnFilterType.FACETED,
                  value: currentValue as string[],
                },
              });
              break;
            }
          }
        } else {
          columnFilters.push({
            id: column.id!,
            value: undefined,
          });
        }
      }
    });

    return columnFilters;
  }

  return [];
};

/**
 * Merge column filters
 */
export const mergeColumnFilters = (
  currentItems: ColumnFiltersState,
  itemsToOverride: ColumnFiltersState
): ColumnFiltersState => {
  const filtersMap = new Map<string, ColumnFilter>();

  currentItems.forEach((item) => {
    filtersMap.set(item.id, item);
  });

  itemsToOverride.forEach((item) => {
    if (item.value) {
      /**
       * Override filter with new value
       */
      filtersMap.set(item.id, item);
    } else {
      /**
       * Remove filter
       */
      filtersMap.delete(item.id);
    }
  });

  return [...filtersMap.values()];
};

/**
 * Get Footer Cell
 */
export const getFooterCell = ({
  context,
  config,
  field,
  theme,
}: {
  config: ColumnConfig;
  field: Field;
  context: HeaderContext<unknown, unknown>;
  theme: GrafanaTheme2;
}): unknown => {
  const calc = config.footer[0];

  /**
   * No footer
   */
  if (calc === undefined) {
    return '';
  }

  /**
   * Get filtered values
   */
  const values = context.table.getFilteredRowModel().rows.map((row) => row.getValue(context.column.id));

  /**
   * Create field with filtered values
   */
  const [filteredField] = toDataFrame({
    fields: [
      {
        ...field,
        values,
      },
    ],
  }).fields;

  const fieldCalcValue = reduceField({ field: filteredField, reducers: config.footer })[calc];
  const format = field.display ?? getDisplayProcessor({ field: filteredField, theme });

  /**
   * If the reducer preserves units then format the
   * end value with the field display processor
   */
  const reducerInfo = fieldReducers.get(calc);
  if (reducerInfo.preservesUnits) {
    return formattedValueToString(format(fieldCalcValue));
  }

  /**
   * Otherwise we simply return the formatted string
   */
  return formattedValueToString({ text: fieldCalcValue });
};

/**
 * Convert Table To Data Frame
 */
export const convertTableToDataFrame = <TData>(table: TableInstance<TData>): DataFrame => {
  const headerGroup = table.getHeaderGroups()[0];
  const fields = headerGroup.headers.map((header): Field => {
    const currentName = String(header.column.columnDef.header || header.column.columnDef.id);

    const field = header.column.columnDef.meta?.field || { name: currentName, type: FieldType.other, config: {} };

    return {
      ...field,
      name: currentName,
      config: {
        ...field.config,
        displayName: currentName,
      },
      values: [],
    };
  });

  /**
   * Add rows
   */
  table.getRowModel().rows.forEach((row) => {
    row.getVisibleCells().forEach((cell, cellIndex) => {
      fields[cellIndex].values.push(cell.getValue());
    });
  });

  /**
   * Add footer row
   */
  if (table.getAllColumns().some((column) => !!column.columnDef.meta?.footerEnabled)) {
    const footerGroup = table.getFooterGroups()[0];

    footerGroup.headers.forEach((header, index) => {
      const calc = header.column.columnDef.meta?.config.footer[0];

      /**
       * No reducer
       */
      if (!calc) {
        fields[index].values.push(null);
        return;
      }

      const fieldCalcValue = reduceField({ field: fields[index], reducers: [calc] })[calc];
      fields[index].values.push(fieldCalcValue);
    });
  }

  /**
   * Data Frame for export
   */
  return toDataFrame({ fields });
};

/**
 * Create Column Accessor Fn
 */
export const createColumnAccessorFn = (accessorKey: string) => (row: unknown) =>
  (row as Record<string, unknown>)[accessorKey];

/**
 * Convert available string value to boolean
 */
export const convertStringValueToBoolean = (value: string): boolean => {
  switch (value) {
    case 'true':
    case 'yes':
    case '1': {
      return true;
    }
    case 'false':
    case 'no':
    case '0': {
      return false;
    }
    default: {
      return false;
    }
  }
};

/**
 * normalize Boolean Cell Value
 */
export const normalizeBooleanCellValue = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return convertStringValueToBoolean(value);
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  return false;
};

/**
 * Get First Highlighted Row Index
 * Rows are only visible items
 * @param rows
 */
export const getFirstHighlightedRowIndex = <TData>(rows: Array<Row<TData>>): number => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];

    /**
     * Row is a group, so skip
     */
    if (row.originalSubRows) {
      continue;
    }

    /**
     * Highlighted row found
     */
    if (get(row.original, ROW_HIGHLIGHT_STATE_KEY)) {
      return rowIndex;
    }
  }

  return -1;
};

/**
 * Return mix current table from User Preferences
 * @param currentTable
 * @param userPreferences
 */
export const getTableWithPreferences = (currentTable: TableConfig | undefined, userPreferences: UserPreferences) => {
  /**
   * Get saved table
   */
  const currentTableName = currentTable?.name || '';
  const savedTable = userPreferences?.tables?.find((tableItem) => tableItem.name === currentTableName);

  if (savedTable) {
    /**
     * Update Items
     */
    const updatedItems = currentTable?.items.map((item) => {
      const currentItem = savedTable.columns?.find((savedColumn) => savedColumn.name === item.field.name);

      if (currentItem) {
        return {
          ...item,
          enabled: currentItem.enabled,
        };
      }

      return item;
    });

    /**
     * Create a map to store the original index of each item in updatedItems
     */
    const updatedItemsMap = new Map(updatedItems?.map((item, index) => [item.field.name, { item, index }]));

    /**
     * Apply order
     */
    const sortedItems = updatedItems?.slice().sort((a, b) => {
      /**
       * Find the index of each item in the savedTable.columns
       */
      const indexA = savedTable.columns.findIndex((column) => column.name === a.field.name);
      const indexB = savedTable.columns.findIndex((column) => column.name === b.field.name);

      /**
       * If both items are not found in savedTable.columns, keep their original order
       */
      if (indexA === -1 && indexB === -1) {
        return updatedItemsMap.get(a.field.name)!.index - updatedItemsMap.get(b.field.name)!.index;
      }

      /**
       * If only item A is not found, it stays in its original position
       */
      if (indexA === -1) {
        return 1;
      }

      /**
       * If only item B is not found, it stays in its original position
       */
      if (indexB === -1) {
        return -1;
      }

      /**
       * Sort items based on their position in savedTable.columns
       */
      return indexA - indexB;
    });

    /**
     * Update Table According with preferences
     */
    return {
      ...currentTable,
      items: sortedItems,
    } as TableConfig;
  }

  return currentTable;
};

/**
 * Preferences Column Configs to TablePreferenceColumn in Preferences
 * @param columnConfigs
 * @param tableName
 * @param userPreferences
 */
export const prepareColumnConfigsForPreferences = (
  columnConfigs: ColumnConfig[],
  tableName: string,
  userPreferences: UserPreferences
): TablePreferenceColumn[] => {
  const table = userPreferences.tables?.find((tableItem) => tableItem.name === tableName);

  return columnConfigs.map((columnConfig) => {
    const existingColumn = table?.columns.find((col) => col.name === columnConfig.field.name);

    return {
      name: columnConfig.field.name,
      enabled: columnConfig.enabled,
      filter: existingColumn?.filter ?? null,
      sort: columnConfig.sort ?? null,
    };
  });
};

/**
 * Save with values for filters
 * @param filter
 */
export const saveWithCorrectFilters = (filter: ColumnFilterValue) => {
  let filterValueToSave: ColumnFilterValue | undefined = undefined;

  switch (filter.type) {
    case ColumnFilterType.SEARCH: {
      if (filter.value) {
        filterValueToSave = filter;
      }
      break;
    }
    case ColumnFilterType.FACETED: {
      if (filter.value.length) {
        filterValueToSave = filter;
      }
      break;
    }
    case ColumnFilterType.NUMBER: {
      filterValueToSave = filter;
      break;
    }
    case ColumnFilterType.TIMESTAMP: {
      if (filter.value.from.isValid() && filter.value.to.isValid()) {
        filterValueToSave = filter;
      }
      break;
    }
  }

  return filterValueToSave;
};

/**
 * Get Saved Filters
 * @param userPreferences
 * @param tableName
 */
export const getSavedFilters = (userPreferences: UserPreferences, tableName: string) => {
  const currentGroup = userPreferences.tables?.find((table) => table.name === tableName);

  if (!currentGroup) {
    return [];
  }

  return currentGroup.columns
    .filter((groupItem) => !!groupItem.filter)
    .map((item) => ({
      id: item.name,
      value: item.filter,
    }));
};

/**
 * Get Saved sorting
 * @param userPreferences
 * @param tableName
 */
export const getSavedSorting = (userPreferences: UserPreferences, tableName: string) => {
  const currentGroup = userPreferences.tables?.find((table) => table.name === tableName);

  /**
   * Return if no group
   */
  if (!currentGroup) {
    return [];
  }

  const firstSortableColumn = currentGroup.columns.find((groupItem) => !!groupItem.sort && groupItem.sort.enabled);

  /**
   * Return [] if no sort group
   * descFirst equal undefined means return []
   */
  if (!firstSortableColumn || firstSortableColumn.sort?.descFirst === undefined) {
    return [];
  }

  /**
   * Return sorting
   */
  return [
    {
      id: firstSortableColumn.name,
      desc: firstSortableColumn.sort?.descFirst,
    },
  ];
};

/**
 * updateUserPreferenceTables
 * @param tableName
 * @param userPreferences
 * @param updatedColumns
 */
export const updateUserPreferenceTables = (
  tableName: string,
  userPreferences: UserPreferences,
  updatedColumns: TablePreferenceColumn[]
) => {
  const updatedTables = userPreferences.tables && !!userPreferences.tables.length ? [...userPreferences.tables] : [];

  const tableIndex = updatedTables.findIndex((table) => table.name === tableName);

  if (tableIndex === -1) {
    updatedTables.push({ name: tableName, columns: updatedColumns });
  } else {
    updatedTables[tableIndex] = {
      ...updatedTables[tableIndex],
      columns: updatedColumns,
    };
  }

  return updatedTables;
};

/**
 * Prepare column with sorting
 * @param drawerColumns
 * @param columnId
 * @param sorting
 */
export const prepareColumnsWithSorting = (
  drawerColumns: ColumnConfig[],
  columnId: string,
  sorting: SortingState
): ColumnConfig[] => {
  /**
   * If prev. sorting state is [] return next state false
   */
  if (!sorting.length) {
    return drawerColumns?.map((column) => {
      if (column.field.name !== columnId) {
        return {
          ...column,
          sort: {
            enabled: false,
            descFirst: false,
          },
        };
      }

      return {
        ...column,
        sort: {
          enabled: true,
          descFirst: false,
        },
      };
    });
  }

  /**
   * Selected column doesn`t equal prev sort state
   */
  if (columnId !== sorting[0].id) {
    return drawerColumns?.map((column) => {
      if (column.field.name !== columnId) {
        return {
          ...column,
          sort: {
            enabled: false,
            descFirst: false,
          },
        };
      }

      return {
        ...column,
        sort: {
          enabled: true,
          descFirst: false,
        },
      };
    });
  }

  /**
   * Set correct next sort state based on prev. sor state
   */
  const updatedSort = sorting[0]?.desc ? undefined : true;

  return drawerColumns.map((column) => {
    if (column.field.name !== sorting[0].id) {
      return {
        ...column,
        sort: {
          enabled: false,
          descFirst: false,
        },
      };
    }

    return {
      ...column,
      sort: {
        enabled: true,
        descFirst: updatedSort,
      },
    };
  }) as ColumnConfig[];
};

/**
 * Prepare column with Filters
 * @param userPreferences
 * @param currentTableName
 * @param drawerColumns
 * @param columnName
 * @param filterValue
 */
export const prepareColumnsWithFilters = (
  userPreferences: UserPreferences,
  currentTableName: string,
  drawerColumns: ColumnConfig[] | undefined,
  columnName: string,
  filterValue?: ColumnFilterValue
) => {
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
    const transformedColumns = prepareColumnConfigsForPreferences(drawerColumns!, currentTableName, userPreferences);

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

  return updatedItems;
};

/**
 * Get Default Filters
 * @param columns
 */
export const getDefaultFilters = <TData>(columns: Array<ColumnDef<TData>>) => {
  return columns
    .map((column) => {
      if (column.meta?.config.filter?.defaultClientValue) {
        return {
          id: column.id,
          value: column.meta.config.filter.defaultClientValue,
        };
      }
      return null;
    })
    .filter(Boolean) as ColumnFiltersState;
};
