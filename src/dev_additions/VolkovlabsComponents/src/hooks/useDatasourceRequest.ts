import { DataQueryResponse, InterpolateFunction, LoadingState } from '@grafana/data';
import {  getDataSourceSrv } from '@grafana/runtime';
import { DatasourceResponseError } from '@volkovlabs/components';
import { useCallback } from 'react';
import { lastValueFrom } from 'rxjs';
// NOTICE dont use this important from @volkovlabs/components
// /**
//  * Data Source Response Error
//  */
// export class DatasourceResponseError {
//   public readonly message: string;
//   constructor(
//     public readonly error: unknown,
//     target: string
//   ) {
//     if (error && typeof error === 'object') {
//       if ('message' in error && typeof error.message === 'string') {
//         this.message = error.message;
//       } else {
//         this.message = JSON.stringify(error, null, 2);
//       }
//     } else {
//       this.message = 'Unknown Error';
//     }
//     this.message += `\nRequest: ${target}`;
//   }
// }
/**
 * Use Data Source Request
 */
export const useDatasourceRequest = () => {
  return useCallback(
    async ({
      query,
      datasource,
      replaceVariables,
      payload,
    }: {
      query: unknown;
      datasource: string;
      replaceVariables: InterpolateFunction;
      payload: unknown;
    }): Promise<DataQueryResponse> => {
      const ds = await getDataSourceSrv().get(datasource);
      /**
       * Replace Variables
       */
      const targetJson = replaceVariables(JSON.stringify(query, null, 2), {
        payload: {
          value: payload,
        },
      });
      const target = JSON.parse(targetJson);
      try {
        /**
         * Response
         */
        
        const response = ds.query({
          targets: [target],
        } as never);
        
        
        const handleResponse = async (response: DataQueryResponse) => {
          // console.log(response)
          if (response?.state === LoadingState.Error   || !response || response?.error || response?.errors || response?.data?.[0]?.fields?.[0]?.name === "errorMessage" ) {
            
            const errorMessage=  response?.errors ?? response?.data?.[0]?.fields?.[0]?.values ?? response;
            throw errorMessage
          }
          return response;
        };
        /**
         * Handle as promise
         */
        if (response instanceof Promise) {
          return await response.then(handleResponse);
        }
        /**
         * Handle as observable
         */
        return await lastValueFrom(response).then(handleResponse);
      } catch (error) {
        
        throw new DatasourceResponseError(error, targetJson);
      }
    },
    []
  );
};