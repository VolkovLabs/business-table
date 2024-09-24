import { useDatasourceRequest } from '@/hooks/useDatasourceRequest';
import { ColumnConfig, NestedObjectConfig } from '@/types';
import { InterpolateFunction } from '@grafana/data';
import { useCallback, useMemo, useState } from 'react';
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

  /**
   * Load
   */
  const onLoad = useCallback(
    async (column: ColumnConfig, tableData: Array<Record<string, unknown>>) => {
      const object = objects.find((object) => object.id === column.objectType);

      if (!object) {
        return;
      }

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

      console.warn('load');

      if (result.data && result.data[0]) {
        setNestedObjectsData((value) => ({
          ...value,
          [object.id]: prepareFrameForNestedObject(object, result.data[0]),
        }));
      }
    },
    [datasourceRequest, objects, replaceVariables]
  );

  /**
   * Get Values
   */
  const getValuesForColumn = useCallback(
    (objectId: string) => {
      console.log(nestedObjectsData, objectId);
      console.log('result', nestedObjectsData[objectId]);
      return nestedObjectsData[objectId];
    },
    [nestedObjectsData]
  );

  return useMemo(() => {
    return {
      onLoad,
      getValuesForColumn,
    };
  }, [getValuesForColumn, onLoad]);
};
