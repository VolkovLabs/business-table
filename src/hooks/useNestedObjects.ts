import { AlertErrorPayload, AppEvents, InterpolateFunction } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { useDatasourceRequest } from '@volkovlabs/components';
import { useCallback, useMemo, useState } from 'react';

import { ColumnConfig, NestedObjectConfig } from '@/types';
import { prepareFrameForNestedObject } from '@/utils';

/**
 * Use Nested Objects
 */
export const useNestedObjects = ({
  objects,
  replaceVariables,
}: {
  objects: NestedObjectConfig[];
  replaceVariables: InterpolateFunction;
}) => {
  /**
   * Data Source Request
   */
  const datasourceRequest = useDatasourceRequest();

  /**
   * Nested Objects Data
   */
  const [nestedObjectsData, setNestedObjectsData] = useState<
    Record<string, Map<string | number, Record<string, unknown>>>
  >({});
  const [nestedObjectsLoading, setNestedObjectsLoading] = useState<Record<string, boolean>>({});

  const appEvents = getAppEvents();

  const notifyError = useCallback(
    (payload: AlertErrorPayload) => appEvents.publish({ type: AppEvents.alertError.name, payload }),
    [appEvents]
  );

  /**
   * Load
   */
  const onLoad = useCallback(
    async (column: ColumnConfig, tableData: Array<Record<string, unknown>>) => {
      const object = objects.find((object) => object.id === column.objectId);
      const ids = tableData.reduce((acc, row) => {
        const value = row[column.field.name];

        if (Array.isArray(value)) {
          return acc.concat(...value);
        }

        return acc.concat(value as never);
      }, []);

      if (!object || !ids.length) {
        return;
      }

      const objectKey = object.id;

      setNestedObjectsLoading((current) => ({
        ...current,
        [objectKey]: true,
      }));

      try {
        const result = await datasourceRequest({
          query: object.get.payload,
          datasource: object.get.datasource,
          payload: {
            rows: tableData,
            ids: ids,
          },
          replaceVariables,
        });

        if (result.data && result.data[0]) {
          setNestedObjectsData((value) => ({
            ...value,
            [objectKey]: prepareFrameForNestedObject(object, result.data[0]),
          }));
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
        notifyError(['Error', errorMessage]);
      }

      setNestedObjectsLoading((current) => ({
        ...current,
        [objectKey]: false,
      }));
    },
    [datasourceRequest, notifyError, objects, replaceVariables]
  );

  /**
   * Get Values
   */
  const getValuesForColumn = useCallback(
    (objectId: string) => {
      return nestedObjectsData[objectId];
    },
    [nestedObjectsData]
  );

  return useMemo(() => {
    return {
      onLoad,
      getValuesForColumn,
      loadingState: nestedObjectsLoading,
    };
  }, [getValuesForColumn, nestedObjectsLoading, onLoad]);
};
