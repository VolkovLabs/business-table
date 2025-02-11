import { StandardEditorProps } from '@grafana/data';
import { InlineSwitch, useStyles2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useState } from 'react';

import { CollapseTitle } from '@/components';
import { TEST_IDS } from '@/constants';
import { PanelOptions, TableConfig } from '@/types';

import { RowHighlightEditor } from './components';
import { getStyles } from './HighlightDataEditor.styles';

/**
 * Properties
 */
type Props = StandardEditorProps<TableConfig[], null, PanelOptions>;

/**
 * Test Ids
 */
export const testIds = TEST_IDS.highlightDataEditor;

/**
 * Add Data Editor
 */
export const HighlightDataEditor: React.FC<Props> = ({ onChange, value }) => {
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
                  value={item.rowHighlight.enabled}
                  onChange={(event) => {
                    onChangeItem({
                      ...item,
                      rowHighlight: {
                        ...item.rowHighlight,
                        enabled: event.currentTarget.checked,
                      },
                    });
                    setCollapseState({
                      ...collapseState,
                      [item.name]: event.currentTarget.checked,
                    });
                  }}
                  {...testIds.fieldItemEnabled.apply(item.name)}
                />
              </CollapseTitle>
            }
            headerTestId={testIds.itemHeader.selector(item.name)}
            contentTestId={testIds.itemContent.selector(item.name)}
            isOpen={collapseState[item.name]}
            onToggle={() => onToggleItemExpandedState(item.name)}
            isExpandDisabled={!item.rowHighlight.enabled}
          >
            <RowHighlightEditor
              value={item.rowHighlight}
              onChange={(rowHighlight) => {
                onChangeItem({
                  ...item,
                  rowHighlight,
                });
              }}
              columns={item.items}
            />
          </Collapse>
        </div>
      ))}
    </>
  );
};
