import { AlertPayload, AppEvents, InterpolateFunction, LoadingState } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { useDashboardRefresh } from '@volkovlabs/components';
import { useCallback } from 'react';
import { TableConfig } from '@/types';
import { onRequestSuccess } from '@/utils';
import {  useDatasourceRequest } from '@/dev_additions/VolkovlabsComponents/src/hooks/useDatasourceRequest';
import { WMLStringObject } from '@windmillcode/wml-components-base';

export const useUpdateRow = ({
  replaceVariables,
  currentTable,
  operation,
  setError
}: {
  replaceVariables: InterpolateFunction;
  currentTable?: TableConfig;
  operation: 'add' | 'update' | 'delete';
  setError: (message: string) => void
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
          successMessage = currentTable?.deleteRow.messages?.notifyMessage
            ? replaceVariables(currentTable?.deleteRow.messages?.notifyMessage)
            : 'Row deleted successfully.';
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


        onRequestSuccess(
          () => notifySuccess(['Success', successMessage]),
          () => refreshDashboard(),
          currentTable,
          operation,
          row as Record<string, unknown>
        );
      } catch (e: any) {

        let errorMessage = ""
        let notifyType : "panel" | "toast" = "toast"
        const capitalizedOperation = new WMLStringObject({orig:operation}).capitalize(false)
        if(e.error){
          errorMessage = Array.isArray(e.error) ? e.error.reduce((acc,x)=> acc +"\n"+x) : e.error
          errorMessage = `${capitalizedOperation} Error: ${errorMessage}`
        }
        else {
          if (e instanceof Error && e.message) {
            errorMessage = `${capitalizedOperation} Error: ${e.message}`;
          } else if (Array.isArray(e)) {
            errorMessage = `${capitalizedOperation} Error: ${e[0]}`;
          } else {
            errorMessage = `${capitalizedOperation} Error: ${JSON.stringify(e)}`;
            notifyType = "panel";
          }
        }
        if(notifyType ==="toast"){
          appEvents.publish({
            type: AppEvents.alertError.name,
            payload:[
              errorMessage
            ]
          })          
        }
        else{
          setError(errorMessage);
        }

     
        
        throw e;
      }
    },
    [currentTable, datasourceRequest, notifySuccess, operation, refreshDashboard, replaceVariables, setError,appEvents]
  );
};
