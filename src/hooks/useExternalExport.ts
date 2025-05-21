import { AlertPayload, AppEvents, InterpolateFunction, LoadingState } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import {
  ColumnDef,
  createTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Table,
} from '@tanstack/react-table';
import { useDatasourceRequest } from '@volkovlabs/components';
import { useCallback } from 'react';

import { ACTIONS_COLUMN_ID } from '@/constants';
import { ExternalExportConfig } from '@/types';
import { convertTableToDataFrame, convertToXlsxFormat, format } from '@/utils';

/**
 * Use External export
 */
export const useExternalExport = <TData>({
  data,
  columns,
  externalExport,
  replaceVariables,
  setError,
}: {
  data: TData[];
  columns: Array<ColumnDef<TData>>;
  replaceVariables: InterpolateFunction;
  setError: React.Dispatch<React.SetStateAction<string>>;
  externalExport: ExternalExportConfig;
}) => {
  /**
   * App Events
   */
  const appEvents = getAppEvents();
  const notifySuccess = useCallback(
    (payload: AlertPayload) => appEvents.publish({ type: AppEvents.alertSuccess.name, payload }),
    [appEvents]
  );

  /**
   * Data Source Request
   */
  const datasourceRequest = useDatasourceRequest();

  return useCallback(
    async ({ table }: { table: Table<TData> | null }) => {
      setError('');

      if (!table || !externalExport?.request?.payload || !externalExport?.request?.datasource) {
        return;
      }

      try {
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
        const tableData = convertToXlsxFormat(dataFrame);

        const formatFn = (original: unknown, variable: { name?: string }) => format(original, variable, tableData);

        const response = await datasourceRequest({
          query: externalExport.request.payload,
          datasource: externalExport.request.datasource,
          replaceVariables: (...params: Parameters<InterpolateFunction>) =>
            replaceVariables(params[0], params[1], formatFn),
          payload: tableData,
        });

        /**
         * Query Error
         */
        if (response.state === LoadingState.Error) {
          throw response.errors;
        }

        notifySuccess(['Success', 'Table exported successfully. ']);
      } catch (e: unknown) {
        const errorMessage = `Error: ${e instanceof Error && e.message ? e.message : Array.isArray(e) ? e[0] : JSON.stringify(e)}`;
        setError(errorMessage);
        throw e;
      }
    },
    [
      columns,
      data,
      datasourceRequest,
      externalExport?.request?.datasource,
      externalExport?.request?.payload,
      notifySuccess,
      replaceVariables,
      setError,
    ]
  );
};
