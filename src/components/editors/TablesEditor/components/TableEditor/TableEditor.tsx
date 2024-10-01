import { DataFrame } from '@grafana/data';
import React from 'react';

import { EditorProps, TableConfig } from '@/types';

import { ColumnsEditor } from './components';

/**
 * Properties
 */
interface Props extends EditorProps<TableConfig> {
  /**
   * Data
   */
  data: DataFrame[];
}

/**
 * Table Editor
 */
export const TableEditor: React.FC<Props> = ({ value, onChange, data }) => {
  return (
    <ColumnsEditor
      name={value.name}
      value={value.items}
      data={data}
      onChange={(items) => {
        onChange({
          ...value,
          items,
        });
      }}
    />
  );
};
