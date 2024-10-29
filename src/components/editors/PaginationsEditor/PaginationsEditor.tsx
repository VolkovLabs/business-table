import { StandardEditorProps } from '@grafana/data';
import { InlineSwitch, Tag, useStyles2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useState } from 'react';

import { CollapseTitle } from '@/components';
import { TEST_IDS } from '@/constants';
import { PanelOptions, TableConfig } from '@/types';
import { hasTablePaginationError } from '@/utils';

import { PaginationEditor } from './components';
import { getStyles } from './PaginationsEditor.styles';

/**
 * Properties
 */
type Props = StandardEditorProps<TableConfig[], null, PanelOptions>;

/**
 * Test Ids
 */
const testIds = TEST_IDS.paginationsEditor;

/**
 * Paginations editor
 */
export const PaginationsEditor: React.FC<Props> = ({ context: { data }, onChange, value }) => {
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
                  value={item.pagination.enabled}
                  transparent={true}
                  onChange={(event) => {
                    onChangeItem({
                      ...item,
                      pagination: {
                        ...item.pagination,
                        enabled: event.currentTarget.checked,
                      },
                    });

                    /**
                     * Toggle Collapse State
                     */
                    setCollapseState({
                      ...collapseState,
                      [item.name]: event.currentTarget.checked,
                    });
                  }}
                  showLabel={true}
                  {...testIds.fieldPaginationEnabled.apply(item.name)}
                />
                {hasTablePaginationError(item) && <Tag name="Error" colorIndex={0} />}
              </CollapseTitle>
            }
            headerTestId={testIds.itemHeader.selector(item.name)}
            contentTestId={testIds.itemContent.selector(item.name)}
            isOpen={collapseState[item.name]}
            onToggle={() => onToggleItemExpandedState(item.name)}
            isExpandDisabled={!item.pagination.enabled}
          >
            <PaginationEditor value={item} onChange={onChangeItem} data={data} />
          </Collapse>
        </div>
      ))}
    </>
  );
};
