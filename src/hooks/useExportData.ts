import { dateTimeFormat, InterpolateFunction, toCSV } from '@grafana/data';
import {
  ColumnDef,
  createTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Table,
} from '@tanstack/react-table';
import { useCallback } from 'react';

import { ACTIONS_COLUMN_ID } from '@/constants';
import { ExportFormatType, TableConfig } from '@/types';
import { convertTableToDataFrame, convertToXlsxFormat, downloadCsv, downloadXlsx } from '@/utils';

/**
 * Use Export Data
 */
export const useExportData = <TData>({
  data,
  columns,
  tableConfig,
  panelTitle,
  exportFormat,
  replaceVariables,
}: {
  data: TData[];
  columns: Array<ColumnDef<TData>>;
  tableConfig?: TableConfig;
  panelTitle: string;
  exportFormat: ExportFormatType;
  replaceVariables: InterpolateFunction;
}) => {
  return useCallback(
    ({ table }: { table: Table<TData> | null }) => {
      if (!table) {
        return;
      }

      /**
       * Current Table State
       */
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
        onStateChange: null as never,
        renderFallbackValue: null,
      });

      /**
       * Data Frame For Export
       */
      const dataFrame = convertTableToDataFrame(tableForExport);

      /**
       * CSV text
       */
      const content = toCSV([dataFrame], {
        useExcelHeader: false,
      });

      /**
       * Filename Prefix
       */
      let prefix = '';

      /**
       * Add Panel Title
       */
      if (panelTitle) {
        prefix += `${replaceVariables(panelTitle)}-`;
      }

      /**
       * Add Table Name
       */
      if (tableConfig?.name) {
        prefix += `${tableConfig.name}-`;
      }

      /**
       * Download XLSX File
       */
      if (exportFormat === ExportFormatType.XLSX) {
        const xlsxContent = convertToXlsxFormat(dataFrame);
        return downloadXlsx(xlsxContent, `${prefix}${dateTimeFormat(new Date())}`, tableConfig?.name);
      }

      /**
       * Download CSV File
       */
      return downloadCsv(content, `${prefix}${dateTimeFormat(new Date())}`);
    },
    [columns, data, exportFormat, panelTitle, replaceVariables, tableConfig?.name]
  );
};
