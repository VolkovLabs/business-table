import { DataFrame, Field, FieldType, InterpolateFunction, PanelData } from '@grafana/data';
import { config, getTemplateSrv } from '@grafana/runtime';
import { useTheme2 } from '@grafana/ui';
import { ColumnDef } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo } from 'react';

import { AggregatedCellRenderer, CellRenderer, editableColumnEditorsRegistry, TableActionsCell } from '@/components';
import { nestedObjectEditorsRegistry } from '@/components/editors/NestedObjectsEditor/components';
import { ACTIONS_COLUMN_ID } from '@/constants';
import {
  CellAggregation,
  CellType,
  ColumnConfig,
  ColumnEditorConfig,
  ColumnEditorControlOptions,
  ColumnFilterMode,
  ColumnFilterType,
  ColumnPinDirection,
  NestedObjectConfig,
  NestedObjectControlOptions,
} from '@/types';
import {
  checkIfOperationEnabled,
  columnFilter,
  filterFieldBySource,
  getFooterCell,
  getFrameBySource,
  getSupportedFilterTypesForVariable,
} from '@/utils';

import { useNestedObjects } from './useNestedObjects';

/**
 * Use Table
 */
export const useTable = ({
  data,
  columns: columnsConfig,
  objects,
  replaceVariables,
}: {
  data: PanelData;
  columns?: ColumnConfig[];
  objects: NestedObjectConfig[];
  replaceVariables: InterpolateFunction;
}) => {
  /**
   * Theme
   */
  const theme = useTheme2();

  /**
   * Template Service
   */
  const templateService = getTemplateSrv();

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
    return columnsConfig?.filter((column) => column.type === CellType.NESTED_OBJECTS);
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
   * Table Data With Nested Objects
   */
  const tableData = useMemo(() => {
    const nestedObjectsForRow =
      columnsWithNestedObjects?.reduce((acc, column) => {
        return {
          ...acc,
          [column.field.name]: getNestedData(column.objectId),
        };
      }, {}) || {};

    return tableRawData.map((row) => {
      return {
        ...row,
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
  }, [columnsWithNestedObjects, getNestedData, tableRawData]);

  /**
   * Get Editor Control Options
   */
  const getEditorControlOptions = useCallback(
    (editorConfig: ColumnEditorConfig): ColumnEditorControlOptions => {
      const item = editableColumnEditorsRegistry.get(editorConfig.type);

      if (item) {
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

    const columns: Array<ColumnDef<unknown>> = [];

    for (const column of columnsData.items) {
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
        const variable = templateService.getVariables().find((item) => item.name === column.config.filter.variable);

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

      const header = column.config.label || column.field.config?.displayName || column.field.name;

      columns.push({
        id: column.field.name,
        accessorKey: column.field.name,
        header,
        cell: CellRenderer,
        aggregatedCell: AggregatedCellRenderer,
        enableGrouping: column.config.group,
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
          footerEnabled: column.config.footer.length > 0,
          editable: isEditAllowed,
          editor: isEditAllowed ? getEditorControlOptions(column.config.edit.editor) : undefined,
          nestedObjectOptions: nestedObjectConfig
            ? getNestedObjectControlOptions(nestedObjectConfig, header)
            : undefined,
        },
        footer: (context) => getFooterCell({ context, config: column.config, field: column.field, theme }),
        ...sizeParams,
      });
    }

    /**
     * Add Actions Column If Enabled
     */
    if (isActionsEnabled) {
      columns.push({
        id: ACTIONS_COLUMN_ID,
        cell: TableActionsCell,
        size: 120,
        maxSize: 120,
        enablePinning: columns.some(
          (column) => column.enablePinning && column.meta?.config.pin === ColumnPinDirection.RIGHT
        ),
      });
    }

    return columns;
  }, [
    columnsData.frame,
    columnsData.items,
    data.series,
    getEditorControlOptions,
    getNestedObjectControlOptions,
    objects,
    templateService,
    theme,
  ]);

  return useMemo(
    () => ({
      tableData,
      columns,
    }),
    [tableData, columns]
  );
};
