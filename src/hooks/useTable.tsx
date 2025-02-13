import { DataFrame, EventBus, Field, FieldType, InterpolateFunction, PanelData } from '@grafana/data';
import { config } from '@grafana/runtime';
import { useTheme2 } from '@grafana/ui';
import { ColumnDef, ColumnMeta } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo } from 'react';

import {
  AggregatedCellRenderer,
  CellRenderer,
  editableColumnEditorsRegistry,
  nestedObjectEditorsRegistry,
  TableActionsCell,
} from '@/components';
import { ACTIONS_COLUMN_ID, ROW_HIGHLIGHT_STATE_KEY } from '@/constants';
import {
  ActionsColumnConfig,
  CellAggregation,
  CellType,
  ColumnConfig,
  ColumnEditorConfig,
  ColumnEditorControlOptions,
  ColumnFilterMode,
  ColumnFilterType,
  ColumnHeaderFontSize,
  ColumnPinDirection,
  NestedObjectConfig,
  NestedObjectControlOptions,
  RowHighlightConfig,
} from '@/types';
import {
  checkIfOperationEnabled,
  columnFilter,
  createColumnAccessorFn,
  filterFieldBySource,
  getFieldKey,
  getFooterCell,
  getFrameBySource,
  getSupportedFilterTypesForVariable,
} from '@/utils';

import { useNestedObjects } from './useNestedObjects';
import { useRuntimeVariables } from './useRuntimeVariables';

/**
 * Use Table
 */
export const useTable = ({
  data,
  isAddRowEnabled = false,
  isDeleteRowEnabled = false,
  columns: columnsConfig,
  actionsColumnConfig,
  objects,
  replaceVariables,
  rowHighlightConfig,
  eventBus,
}: {
  data: PanelData;
  isAddRowEnabled?: boolean;
  isDeleteRowEnabled?: boolean;
  columns?: ColumnConfig[];
  actionsColumnConfig?: ActionsColumnConfig;
  objects: NestedObjectConfig[];
  replaceVariables: InterpolateFunction;
  rowHighlightConfig?: RowHighlightConfig;
  eventBus: EventBus;
}) => {
  /**
   * Theme
   */
  const theme = useTheme2();

  /**
   * Variables
   */
  const { getVariable } = useRuntimeVariables(eventBus, '');

  /**
   * Columns Data
   */
  const columnsData = useMemo((): { frame: DataFrame | null; items: Array<{ config: ColumnConfig; field: Field }> } => {
    if (!columnsConfig?.[0]?.field) {
      return {
        frame: null,
        items: [],
      };
    }

    const frame = getFrameBySource(data.series, columnsConfig?.[0].field);

    /**
     * No Frame
     */
    if (!frame) {
      return {
        frame: null,
        items: [],
      };
    }

    const items = columnsConfig
      .map((config) => ({
        config,
        field: frame.fields.find((field) => filterFieldBySource(frame, field, config.field)),
      }))
      .filter((item) => !!item.field) as Array<{ config: ColumnConfig; field: Field }>;

    return {
      frame,
      items,
    };
  }, [columnsConfig, data.series]);

  /**
   * Table Data
   */
  const tableRawData = useMemo(() => {
    /**
     * No frame
     */
    if (!columnsData.frame) {
      return [];
    }

    const rows = [];

    for (let rowIndex = 0; rowIndex < columnsData.frame.length; rowIndex += 1) {
      const row = columnsData.items.reduce(
        (acc, item) => ({
          ...acc,
          [item.field.name]: item.field.values[rowIndex],
        }),
        {}
      );

      rows.push(row);
    }

    return rows;
  }, [columnsData]);

  /**
   * Nested Objects
   */
  const {
    onLoad: onLoadNestedData,
    getValuesForColumn: getNestedData,
    loadingState: nestedDataLoadingState,
  } = useNestedObjects({
    objects,
    replaceVariables,
  });

  /**
   * Columns With Nested Objects
   */
  const columnsWithNestedObjects = useMemo(() => {
    return columnsConfig?.filter((column) => column.type === CellType.NESTED_OBJECTS && column.enabled);
  }, [columnsConfig]);

  /**
   * Load Nested Objects
   */
  useEffect(() => {
    if (columnsWithNestedObjects?.length) {
      columnsWithNestedObjects.forEach((column) => {
        /**
         * Load Nested Data
         */
        onLoadNestedData(column, tableRawData);
      });
    }
  }, [columnsWithNestedObjects, onLoadNestedData, tableRawData]);

  /**
   * Table Data With Nested Objects and Highlight State
   */
  const tableData = useMemo(() => {
    const nestedObjectsForRow =
      columnsWithNestedObjects?.reduce((acc, column) => {
        return {
          ...acc,
          [column.field.name]: getNestedData(column.objectId),
        };
      }, {}) || {};

    const rowsHighlightState: boolean[] = [];

    /**
     * Calculate Rows Highlight State
     */
    if (rowHighlightConfig && rowHighlightConfig.enabled) {
      const item = columnsData.items.find((item) => getFieldKey(item.config.field) === rowHighlightConfig.columnId);
      const variable = getVariable(rowHighlightConfig.variable);

      if (item && variable && 'current' in variable) {
        const variableValueMap = Array.isArray(variable.current.value)
          ? variable.current.value.reduce(
              (acc, value) => ({
                ...acc,
                [value]: true,
              }),
              {} as Record<string, boolean>
            )
          : { [variable.current.value as string]: true };

        item.field.values.forEach((value) => {
          rowsHighlightState.push(variableValueMap[value] ?? false);
        });
      }
    }

    return tableRawData.map((row, rowIndex) => {
      const additionRowInfo: Record<string, unknown> = {};

      /**
       * Add Row Highlight State
       */
      if (rowHighlightConfig?.enabled) {
        additionRowInfo[ROW_HIGHLIGHT_STATE_KEY] = rowsHighlightState[rowIndex] ?? false;
      }

      return {
        ...row,
        ...additionRowInfo,
        ...Object.entries(nestedObjectsForRow).reduce((acc, [key, nestedData]) => {
          const ids = row[key as keyof typeof row] as unknown;

          if (Array.isArray(ids) && nestedData instanceof Map) {
            return {
              ...acc,
              [key]: ids.map((id) => nestedData.get(id)).filter((item) => !!item),
            };
          }

          return acc;
        }, {}),
      };
    });
  }, [columnsWithNestedObjects, rowHighlightConfig, tableRawData, getNestedData, columnsData.items, getVariable]);

  /**
   * Get Editor Control Options
   */
  const getEditorControlOptions = useCallback(
    (editorConfig: ColumnEditorConfig): ColumnEditorControlOptions => {
      const item = editableColumnEditorsRegistry.get(editorConfig.type);

      if (item) {
        // @ts-expect-error
        return item?.getControlOptions({ config: editorConfig as never, data });
      }

      return editorConfig as ColumnEditorControlOptions;
    },
    [data]
  );

  /**
   * Get Nested Object Control Options
   */
  const getNestedObjectControlOptions = useCallback(
    (object: NestedObjectConfig, header: string): NestedObjectControlOptions | undefined => {
      const item = nestedObjectEditorsRegistry.get(object.type);

      if (item) {
        return item?.getControlOptions({
          header,
          config: object.editor,
          data,
          isLoading: nestedDataLoadingState[object.id],
          operations: {
            add: {
              enabled: object.add
                ? checkIfOperationEnabled(object.add, {
                    series: data.series,
                    user: config.bootData.user,
                  })
                : false,
              request: object.add?.request,
            },
            update: {
              enabled: object.update
                ? checkIfOperationEnabled(object.update, {
                    series: data.series,
                    user: config.bootData.user,
                  })
                : false,
              request: object.update?.request,
            },
            delete: {
              enabled: object.delete
                ? checkIfOperationEnabled(object.delete, {
                    series: data.series,
                    user: config.bootData.user,
                  })
                : false,
              request: object.delete?.request,
            },
          },
        });
      }

      return;
    },
    [data, nestedDataLoadingState]
  );

  /**
   * Columns
   */
  const columns = useMemo(() => {
    const frame = columnsData.frame;

    if (!frame) {
      return [];
    }

    /**
     * Actions Enabled
     */
    let isActionsEnabled = false;

    /**
     * Check If Add Row Enabled
     */
    if (isAddRowEnabled) {
      isActionsEnabled = true;
    }

    /**
     * Check If Delete Row Enabled
     */
    if (isDeleteRowEnabled) {
      isActionsEnabled = true;
    }

    const columns: Array<ColumnDef<unknown>> = [];

    /**
     * Use only visible columns
     */
    const enabledColumns = columnsData.items.filter((column) => column.config.enabled);

    for (const column of enabledColumns) {
      const availableFilterTypes: ColumnFilterType[] = [];

      /**
       * Calc available filter types for client side filtering
       */
      if (column.config.filter.mode === ColumnFilterMode.CLIENT) {
        switch (column.field.type) {
          case FieldType.string: {
            availableFilterTypes.push(...[ColumnFilterType.SEARCH, ColumnFilterType.FACETED]);
            break;
          }
          case FieldType.number: {
            availableFilterTypes.push(...[ColumnFilterType.NUMBER]);
            break;
          }
          case FieldType.time: {
            availableFilterTypes.push(...[ColumnFilterType.TIMESTAMP]);
            break;
          }
          default: {
            availableFilterTypes.push(...[ColumnFilterType.SEARCH, ColumnFilterType.FACETED]);
          }
        }
      } else if (column.config.filter.mode === ColumnFilterMode.QUERY) {
        /**
         * Calc available filter types for query side filter
         */
        const variable = getVariable(column.config.filter.variable);

        if (variable) {
          availableFilterTypes.push(...getSupportedFilterTypesForVariable(variable));
        }
      }

      const sizeParams: Partial<Pick<ColumnDef<unknown>, 'size' | 'minSize' | 'maxSize'>> = {};

      /**
       * Set column size
       */
      if (column.config.appearance.width.auto) {
        sizeParams.minSize = column.config.appearance.width.min;
        sizeParams.maxSize = column.config.appearance.width.max;
      } else {
        sizeParams.size = column.config.appearance.width.value;
        sizeParams.maxSize = column.config.appearance.width.value;
      }

      const isEditAllowed = checkIfOperationEnabled(column.config.edit, {
        series: data.series,
        user: config.bootData.user,
      });

      const isColumnAddRowEditable = isAddRowEnabled ? column.config.newRowEdit.enabled : false;

      /**
       * Edit Allowed
       */
      if (isEditAllowed) {
        isActionsEnabled = true;
      }

      const nestedObjectConfig =
        column.config.type === CellType.NESTED_OBJECTS
          ? objects.find((object) => object.id === column.config.objectId)
          : undefined;

      const header = replaceVariables(column.config.label) || column.field.config?.displayName || column.field.name;

      /**
       * Check for columns with grouping enabled that are last and may not have sub rows
       */
      const isGroupingEnable = () => {
        /**
         * All columns excluded nested type
         */
        const filteredColumns = enabledColumns.filter((column) => column.config.type !== CellType.NESTED_OBJECTS);

        /**
         * Check is nested columns is existed
         */
        const isNestedColumnsExist = enabledColumns.some((column) => column.config.type === CellType.NESTED_OBJECTS);

        const columnIndex = filteredColumns.findIndex((columnItem) => columnItem.field.name === column.field.name);

        /**
         * If the column is the last and grouping is enabled
         */
        if (column.config.group && columnIndex + 1 === filteredColumns.length && !isNestedColumnsExist) {
          return false;
        }
        return column.config.group;
      };

      columns.push({
        id: column.field.name,
        accessorFn: createColumnAccessorFn(column.field.name),
        header,
        cell: CellRenderer,
        aggregatedCell: AggregatedCellRenderer,
        enableGrouping: isGroupingEnable(),
        aggregationFn: column.config.aggregation === CellAggregation.NONE ? () => null : column.config.aggregation,
        enableColumnFilter: column.config.filter.enabled && availableFilterTypes.length > 0,
        filterFn: column.config.filter.mode === ColumnFilterMode.CLIENT ? columnFilter : () => true,
        enableSorting: column.config.sort.enabled,
        sortDescFirst: column.config.sort.descFirst,
        enablePinning: column.config.pin !== ColumnPinDirection.NONE,
        meta: {
          availableFilterTypes,
          filterMode: column.config.filter.mode,
          filterVariableName: column.config.filter.variable,
          config: column.config,
          field: column.field,
          scale: column.config.scale,
          footerEnabled: column.config.footer.length > 0,
          editable: isEditAllowed,
          editor: isEditAllowed ? getEditorControlOptions(column.config.edit.editor) : undefined,
          nestedObjectOptions: nestedObjectConfig
            ? getNestedObjectControlOptions(nestedObjectConfig, header)
            : undefined,
          addRowEditable: isColumnAddRowEditable,
          addRowEditor: isColumnAddRowEditable ? getEditorControlOptions(column.config.newRowEdit.editor) : undefined,
        },
        footer: (context) => getFooterCell({ context, config: column.config, field: column.field, theme }),
        ...sizeParams,
      });
    }

    /**
     * Add Actions Column If Enabled
     */
    if (isActionsEnabled) {
      const actionColumnSize: Partial<Pick<ColumnDef<unknown>, 'size' | 'minSize' | 'maxSize'>> = {};

      /**
       * Set column size
       */
      if (actionsColumnConfig?.width.auto) {
        actionColumnSize.minSize = actionsColumnConfig?.width.min;
        actionColumnSize.maxSize = actionsColumnConfig?.width.max;
      } else {
        actionColumnSize.size = actionsColumnConfig?.width.value;
        actionColumnSize.maxSize = actionsColumnConfig?.width.value;
      }

      const header = actionsColumnConfig?.label ? replaceVariables(actionsColumnConfig?.label) : '';

      const currentMeta = {
        config: {
          appearance: {
            header: {
              fontSize: actionsColumnConfig?.fontSize ?? ColumnHeaderFontSize.LG,
            },
            alignment: actionsColumnConfig?.alignment,
          },
        },
      } as ColumnMeta<unknown, unknown>;

      columns.push({
        id: ACTIONS_COLUMN_ID,
        header: header,
        cell: TableActionsCell,
        meta: currentMeta,
        enablePinning: columns.some(
          (column) => column.enablePinning && column.meta?.config.pin === ColumnPinDirection.RIGHT
        ),
        ...actionColumnSize,
      });
    }

    return columns;
  }, [
    columnsData.frame,
    columnsData.items,
    isAddRowEnabled,
    isDeleteRowEnabled,
    data.series,
    objects,
    replaceVariables,
    getEditorControlOptions,
    getNestedObjectControlOptions,
    getVariable,
    theme,
    actionsColumnConfig?.width.auto,
    actionsColumnConfig?.width.min,
    actionsColumnConfig?.width.max,
    actionsColumnConfig?.width.value,
    actionsColumnConfig?.label,
    actionsColumnConfig?.fontSize,
    actionsColumnConfig?.alignment,
  ]);

  return useMemo(
    () => ({
      tableData,
      columns,
    }),
    [tableData, columns]
  );
};
