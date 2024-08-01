import { DataFrame, Field, PanelData } from '@grafana/data';
import { ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';

import { CellRenderer } from '../components';
import { ColumnConfig } from '../types';
import { filterFieldBySource, getFrameBySource } from '../utils';

/**
 * Use Table
 */
export const useTable = ({ data, columns: columnsConfig }: { data: PanelData; columns?: ColumnConfig[] }) => {
  /**
   * Columns Data
   */
  const columnsData = useMemo((): { frame: DataFrame | null; items: Array<{ config: ColumnConfig; field: Field }> } => {
    if (!columnsConfig?.[0].field) {
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
  const tableData = useMemo(() => {
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
   * Columns
   */
  const columns = useMemo(() => {
    const frame = columnsData.frame;

    if (!frame) {
      return [];
    }

    const columns: Array<ColumnDef<unknown>> = [];

    for (const column of columnsData.items) {
      columns.push({
        id: column.field.name,
        accessorKey: column.field.name,
        header: column.config.label || column.field.config?.displayName || column.field.name,
        cell: (props) => <CellRenderer {...props} config={column.config} field={column.field} />,
      });
    }

    return columns;
  }, [columnsData.frame, columnsData.items]);

  return useMemo(
    () => ({
      tableData,
      columns,
    }),
    [tableData, columns]
  );
};
