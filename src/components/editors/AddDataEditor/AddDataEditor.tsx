import { StandardEditorProps } from '@grafana/data';
import { InlineSwitch, useStyles2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useState } from 'react';

import { CollapseTitle } from '@/components';
import { TEST_IDS } from '@/constants';
import { PanelOptions, TableConfig } from '@/types';

import { getStyles } from './AddDataEditor.styles';
import { TableAddRowEditor } from './components';

/**
 * Properties
 */
type Props = StandardEditorProps<TableConfig[], null, PanelOptions>;

/**
 * Test Ids
 */
const testIds = TEST_IDS.addDataEditor;

/**
 * Add Data Editor
 */
export const AddDataEditor: React.FC<Props> = ({ context: { data }, onChange, value }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * States
   */
  const [collapseState, setCollapseState] = useState<Record<string, boolean>>({});

  /**
   /**
   * Change Items
   */
  const onChangeValue = useCallback(
    (items: TableConfig[]) => {
      onChange(items);
    },
    [onChange]
  );

  /**
   * Toggle Item Expanded State
   */
  const onToggleItemExpandedState = useCallback((name: string) => {
    setCollapseState((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }, []);

  /**
   * Change Item
   */
  const onChangeItem = useCallback(
    (updatedItem: TableConfig) => {
      onChangeValue(value.map((item) => (item.name === updatedItem.name ? updatedItem : item)));
    },
    [value, onChangeValue]
  );

  return (
    <>
      {value.map((item) => (
        <div key={item.name} className={styles.item}>
          <Collapse
            title={
              <CollapseTitle>
                {item.name}
                <InlineSwitch
                  transparent={true}
                  value={item.addRow.enabled}
                  onChange={(event) => {
                    onChangeItem({
                      ...item,
                      addRow: {
                        ...item.addRow,
                        enabled: event.currentTarget.checked,
                      },
                    });
                    setCollapseState({
                      ...collapseState,
                      [item.name]: event.currentTarget.checked,
                    });
                  }}
                ></InlineSwitch>
              </CollapseTitle>
            }
            headerTestId={testIds.itemHeader.selector(item.name)}
            contentTestId={testIds.itemContent.selector(item.name)}
            isOpen={collapseState[item.name]}
            onToggle={() => onToggleItemExpandedState(item.name)}
            isExpandDisabled={!item.addRow.enabled}
          >
            <TableAddRowEditor value={item} onChange={onChangeItem} data={data} />
          </Collapse>
        </div>
      ))}
    </>
  );
};
