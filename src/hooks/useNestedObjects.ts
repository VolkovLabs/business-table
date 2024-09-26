import { InterpolateFunction } from '@grafana/data';
import { useCallback, useMemo, useState } from 'react';

import { useDatasourceRequest } from '@/hooks/useDatasourceRequest';
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
  const [nestedObjectsData, setNestedObjectsData] = useState<Record<string, Map<string, Record<string, unknown>>>>({});
  const [nestedObjectsLoading, setNestedObjectsLoading] = useState<Record<string, boolean>>({});

  /**
   * Load
   */
  const onLoad = useCallback(
    async (column: ColumnConfig, tableData: Array<Record<string, unknown>>) => {
      const object = objects.find((object) => object.id === column.objectId);

      if (!object) {
        return;
      }

      const objectKey = object.id;

      setNestedObjectsLoading((current) => ({
        ...current,
        [objectKey]: true,
      }));

      const result = await datasourceRequest({
        query: object.get.payload,
        datasource: object.get.datasource,
        payload: {
          rows: tableData,
          ids: tableData.reduce((acc, row) => {
            const value = row[column.field.name];

            if (Array.isArray(value)) {
              return acc.concat(...value);
            }

            return acc.concat(value as never);
          }, []),
        },
        replaceVariables,
      });

      if (result.data && result.data[0]) {
        setNestedObjectsData((value) => ({
          ...value,
          [objectKey]: prepareFrameForNestedObject(object, result.data[0]),
        }));
      }

      setNestedObjectsLoading((current) => ({
        ...current,
        [objectKey]: false,
      }));
    },
    [datasourceRequest, objects, replaceVariables]
  );

  /**
   * Get Values
   */
  const getValuesForColumn = useCallback(
    (objectId: string) => {
      console.log('getValuesForColumn', nestedObjectsData[objectId]);
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
