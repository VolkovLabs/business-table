import { DataSourceApi } from '@grafana/data';
import { getDataSourceSrv, getTemplateSrv } from '@grafana/runtime';
import { DataQuery } from '@grafana/schema';
import { Alert, LoadingPlaceholder } from '@grafana/ui';
import React, { useCallback, useEffect, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { useAutoSave } from '@/hooks';
import { EditorProps } from '@/types';

/**
 * Properties
 */
interface Props extends EditorProps<unknown> {
  /**
   * Data Source Name
   *
   * @type {string}
   */
  datasourceUid: string;
}

/**
 * Payload Editor
 */
export const DatasourcePayloadEditor: React.FC<Props> = ({ value, onChange, datasourceUid }) => {
  /**
   * Data Source Service
   */
  const dataSourceService = getDataSourceSrv();

  /**
   * Template Service
   */
  const templateService = getTemplateSrv();

  /**
   * Data Source
   */
  const [datasource, setDatasource] = useState<DataSourceApi>();
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Query Auto Save
   */
  const { startTimer, removeTimer } = useAutoSave();
  const [query, setQuery] = useState(value);
  const [isChanged, setIsChanged] = useState(false);

  /**
   * On Change Query
   */
  const onChangeQuery = useCallback((query: unknown) => {
    setQuery(query);
    setIsChanged(true);
  }, []);

  /**
   * On Run query
   */
  const onRunQuery = useCallback(() => null, []);

  /**
   * Save Updates
   */
  const onSaveUpdates = useCallback(() => {
    onChange(query);
    setIsChanged(false);
  }, [onChange, query]);

  /**
   * Load Query Editor
   */
  useEffect(() => {
    const getDataSource = async (datasourceUid: string) => {
      setIsLoading(true);

      const ds = await dataSourceService.get(datasourceUid);

      setIsLoading(false);

      return ds;
    };

    const checkDatasourceType = async () => {
      const loadedDatasource = datasource;
      const replacedDatasourceUid = templateService.replace(datasourceUid);

      /**
       * Reset query if new datasource type
       */
      if (loadedDatasource && loadedDatasource.uid !== replacedDatasourceUid) {
        const currentDatasource = await getDataSource(replacedDatasourceUid);

        if (loadedDatasource.type !== currentDatasource.type) {
          onChangeQuery({});
        }

        setDatasource(currentDatasource);
      }

      /**
       * Load data source
       */
      if (replacedDatasourceUid && !datasource) {
        setDatasource(await getDataSource(replacedDatasourceUid));
      }
    };

    checkDatasourceType();
  }, [datasourceUid, dataSourceService, datasource, onChangeQuery, templateService]);

  /**
   * Auto Save Timer
   */
  useEffect(() => {
    if (isChanged) {
      startTimer(onSaveUpdates);
    } else {
      removeTimer();
    }

    return () => {
      removeTimer();
    };
  }, [startTimer, isChanged, onSaveUpdates, removeTimer]);

  if (isLoading) {
    return (
      <Alert severity="info" title="Please Wait" {...TEST_IDS.payloadEditor.loadingMessage.apply()}>
        <LoadingPlaceholder text="Loading..." />
      </Alert>
    );
  }

  /**
   * No editor or data source
   */
  if (!datasource || !datasource.components?.QueryEditor) {
    return <Alert title="No Query Editor" severity="error" {...TEST_IDS.payloadEditor.errorMessage.apply()} />;
  }

  /**
   * Query Editor
   */
  const Editor = datasource.components.QueryEditor;

  return <Editor datasource={datasource} query={query as DataQuery} onChange={onChangeQuery} onRunQuery={onRunQuery} />;
};
