import { dateTimeFormat, Field, FieldType, reduceField, toCSV, toDataFrame } from '@grafana/data';
import {
  ColumnDef,
  createTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Table,
} from '@tanstack/react-table';
import { saveAs } from 'file-saver';
import { useCallback } from 'react';

import { ACTIONS_COLUMN_ID } from '@/constants';
import { TableConfig } from '@/types';

/**
 * Use Export Data
 */
export const useExportData = <TData>({
  data,
  columns,
  tableConfig,
  panelTitle,
}: {
  data: TData[];
  columns: Array<ColumnDef<TData>>;
  tableConfig?: TableConfig;
  panelTitle: string;
}) => {
  return useCallback(
    ({ table }: { table: Table<TData> | null }) => {
      if (!table) {
        return;
      }

      const tableState = table.getState();

      /**
       * Create Table For Export
       */
      const tableForExport = createTable({
        state: {
          columnFilters: tableState.columnFilters,
          columnPinning: tableState.columnPinning,
          sorting: tableState.sorting,
        },
        data,
        columns: columns.filter((column) => column.id !== ACTIONS_COLUMN_ID),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableFilters: true,
        enableSorting: true,
        onStateChange: () => null,
        renderFallbackValue: () => null,
      });

      const headerGroup = tableForExport.getHeaderGroups()[0];
      const fields = headerGroup.headers.map((header): Field => {
        const field = header.column.columnDef.meta?.field || { name: header.id, type: FieldType.other, config: {} };

        return {
          ...field,
          values: [],
        };
      });

      /**
       * Add rows
       */
      tableForExport.getRowModel().rows.forEach((row) => {
        row.getVisibleCells().forEach((cell, cellIndex) => {
          fields[cellIndex].values.push(cell.getValue());
        });
      });

      /**
       * Add footer row
       */
      if (columns.some((column) => !!column.meta?.footerEnabled)) {
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
      const dataFrame = toDataFrame({ fields });

      /**
       * CSV text
       */
      const csv = toCSV([dataFrame], {
        useExcelHeader: false,
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });

      let prefix = '';

      if (panelTitle) {
        prefix += `${panelTitle}-`;
      }

      if (tableConfig?.name) {
        prefix += `${tableConfig.name}-`;
      }

      saveAs(blob, `${prefix}${dateTimeFormat(new Date())}.csv`);
    },
    [columns, data, panelTitle, tableConfig?.name]
  );
};
