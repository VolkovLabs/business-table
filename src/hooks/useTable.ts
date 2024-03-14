import { Field, PanelData } from '@grafana/data';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import { ColumnMode, FieldSource, PanelOptions } from '../types';
import { getFieldBySource, getSourceKey } from '../utils';

/**
 * Use Table
 */
export const useTable = ({ data, options }: { data: PanelData; options: PanelOptions }) => {
  /**
   * Table Data
   */
  const tableData = useMemo(() => {
    const frame = data.series[0];

    /**
     * No Frame
     */
    if (!frame) {
      return [];
    }

    /**
     * Auto columns
     */
    if (options.columnMode === ColumnMode.AUTO) {
      const rows = [];

      for (let rowIndex = 0; rowIndex < frame.length; rowIndex += 1) {
        const row = frame.fields.reduce(
          (acc, field) => ({
            ...acc,
            [field.name]: field.values[rowIndex],
          }),
          {}
        );

        rows.push(row);
      }

      return rows;
    }

    /**
     * Configured Columns
     */

    /**
     * Fields
     */
    const fieldsForTable = options.columns
      .map(({ field }) => {
        if (!field) {
          return;
        }

        return { field: getFieldBySource(data.series, field), source: field };
      })
      .filter((item): item is { field: Field; source: FieldSource } => !!item && !!item.field);

    const rows: Array<Record<string, unknown>> = [];

    fieldsForTable.forEach(({ field, source }) => {
      const key = getSourceKey(source);

      field.values.forEach((value, rowIndex) => {
        if (!rows[rowIndex]) {
          rows.push({
            [key]: value,
          });
        }

        rows[rowIndex][key] = value;
      });
    });

    return rows;
  }, [data.series, options.columnMode, options.columns]);

  /**
   * Columns
   */
  const columns = useMemo(() => {
    const frame = data.series[0];

    if (!frame) {
      return [];
    }

    /**
     * Auto Columns
     */
    if (options.columnMode === ColumnMode.AUTO) {
      const columns: Array<ColumnDef<unknown>> = [];

      for (const field of frame.fields) {
        columns.push({
          id: field.name,
          accessorKey: field.name,
        });
      }

      return columns;
    }

    /**
     * Configured Columns
     */
    return options.columns.map((column, index): ColumnDef<unknown> => {
      const key = column.field ? getSourceKey(column.field) : index.toString();
      return {
        id: key,
        accessorKey: key,
        header: column.label,
      };
    });
  }, [data.series, options.columnMode, options.columns]);

  return useMemo(
    () => ({
      tableData,
      columns,
    }),
    [tableData, columns]
  );
};
