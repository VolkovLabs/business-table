import { AlertErrorPayload, AlertPayload, AppEvents, InterpolateFunction, LoadingState } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { useDashboardRefresh, useDatasourceRequest } from '@volkovlabs/components';
import { useCallback } from 'react';

import { TableConfig } from '@/types';

export const useUpdateRow = ({
  replaceVariables,
  currentTable,
  operation,
}: {
  replaceVariables: InterpolateFunction;
  currentTable?: TableConfig;
  operation: 'add' | 'update' | 'delete';
}) => {
  /**
   * App Events
   */
  const appEvents = getAppEvents();
  const notifySuccess = useCallback(
    (payload: AlertPayload) => appEvents.publish({ type: AppEvents.alertSuccess.name, payload }),
    [appEvents]
  );
  const notifyError = useCallback(
    (payload: AlertErrorPayload) => appEvents.publish({ type: AppEvents.alertError.name, payload }),
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

      if (operation === 'add') {
        request = currentTable?.addRow.request;
      }

      if (operation === 'update') {
        request = currentTable?.update;
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

        const message = operation === 'add' ? 'Row added successfully.' : 'Values updated successfully.';

        notifySuccess(['Success', message]);
        refreshDashboard();
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e : Array.isArray(e) ? e[0] : 'Unknown Error';
        notifyError(['Error', errorMessage]);
        throw e;
      }
    },
    [
      currentTable?.addRow.request,
      currentTable?.update,
      datasourceRequest,
      notifyError,
      notifySuccess,
      operation,
      refreshDashboard,
      replaceVariables,
    ]
  );
};
