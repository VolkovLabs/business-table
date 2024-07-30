import { StandardEditorProps } from '@grafana/data';
import { Button } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { ColumnOptions, PanelOptions } from '../../types';
import { ColumnEditor } from '../ColumnEditor';

/**
 * Properties
 */
interface Props extends StandardEditorProps<ColumnOptions[], null, PanelOptions> {}

/**
 * Columns Editor
 */
export const ColumnsEditor: React.FC<Props> = ({ onChange, value, context: { data } }) => {
  /**
   * On Add Item
   */
  const onAddItem = useCallback(() => {
    onChange(
      value.concat({
        id: uuidv4(),
        label: '',
      })
    );
  }, [onChange, value]);

  /**
   * On Change Item
   */
  const onChangeItem = useCallback(
    (updatedItem: ColumnOptions) => {
      onChange(value.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    },
    [value, onChange]
  );

  return (
    <div>
      {value.map((item) => (
        <Collapse key={item.id} title={item.label} isOpen={true}>
          <ColumnEditor value={item} onChange={onChangeItem} data={data} />
        </Collapse>
      ))}

      <Button icon="plus-circle" onClick={onAddItem}>
        Add Column
      </Button>
    </div>
  );
};
