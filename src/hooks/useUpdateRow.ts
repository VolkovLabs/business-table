import { AlertPayload, AppEvents, InterpolateFunction, LoadingState } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { useDashboardRefresh, useDatasourceRequest } from '@volkovlabs/components';
import { useCallback } from 'react';

import { TableConfig } from '@/types';

export const useUpdateRow = ({
  replaceVariables,
  currentTable,
  operation,
  setError,
}: {
  replaceVariables: InterpolateFunction;
  currentTable?: TableConfig;
  operation: 'add' | 'update' | 'delete';
  setError: React.Dispatch<React.SetStateAction<string>>;
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
   * Refresh dashboard
   */
  const refreshDashboard = useDashboardRefresh();

  /**
   * Data Source Request
   */
  const datasourceRequest = useDatasourceRequest();

  /**
   * Update Row
   */
  return useCallback(
    async (row: unknown) => {
      let request;
      let successMessage = '';
      setError('');

      switch (operation) {
        case 'add': {
          request = currentTable?.addRow.request;
          successMessage = 'Row added successfully.';
          break;
        }
        case 'update': {
          request = currentTable?.update;
          successMessage = 'Values updated successfully.';
          break;
        }
        case 'delete': {
          request = currentTable?.deleteRow.request;
          successMessage = 'Row deleted successfully.';
          break;
        }
      }

      /**
       * No request
       */
      if (!request) {
        return;
      }

      try {
        const response = await datasourceRequest({
          query: request.payload,
          datasource: request.datasource,
          replaceVariables,
          payload: row,
        });

        /**
         * Query Error
         */
        if (response.state === LoadingState.Error) {
          throw response.errors;
        }

        notifySuccess(['Success', successMessage]);
        refreshDashboard();
      } catch (e: unknown) {
        const errorMessage = `${operation} Error: ${e instanceof Error && e.message ? e.message : Array.isArray(e) ? e[0] : JSON.stringify(e)}`;
        setError(errorMessage);

        throw e;
      }
    },
    [
      currentTable?.addRow.request,
      currentTable?.deleteRow.request,
      currentTable?.update,
      datasourceRequest,
      notifySuccess,
      operation,
      refreshDashboard,
      replaceVariables,
      setError,
    ]
  );
};
