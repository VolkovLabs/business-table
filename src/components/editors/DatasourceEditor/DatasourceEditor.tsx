import { EditorProps } from '@/types';
import { Select } from '@grafana/ui';
import React, { useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { useDatasources } from '@/hooks';

/**
 * Properties
 */
interface Props extends EditorProps<string> {}

/**
 * Data Source Editor
 */
export const DatasourceEditor: React.FC<Props> = ({ value, onChange }) => {
  /**
   * Data Sources
   */
  const datasources = useDatasources();

  /**
   * Options
   */
  const datasourceOptions = useMemo(() => {
    return datasources.map((datasource) => ({
      label: datasource.name,
      value: datasource.name,
    }));
  }, [datasources]);

  /**
   * Return
   */
  return (
    <Select
      onChange={(item) => {
        onChange(item.value!);
      }}
      options={datasourceOptions}
      value={value}
      {...TEST_IDS.datasourceEditor.fieldSelect.apply()}
    />
  );
};
