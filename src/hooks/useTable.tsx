import { PanelData } from '@grafana/data';
import { ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';

import { CellRenderer } from '../components';

/**
 * Use Table
 */
export const useTable = ({ data }: { data: PanelData }) => {
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
  }, [data.series]);

  /**
   * Columns
   */
  const columns = useMemo(() => {
    const frame = data.series[0];

    if (!frame) {
      return [];
    }

    const columns: Array<ColumnDef<unknown>> = [];

    for (const field of frame.fields) {
      columns.push({
        id: field.name,
        accessorKey: field.name,
        header: field.config?.displayName || field.name,
        cell: (props) => <CellRenderer {...props} field={field} />,
      });
    }

    return columns;
  }, [data.series]);

  return useMemo(
    () => ({
      tableData,
      columns,
    }),
    [tableData, columns]
  );
};
