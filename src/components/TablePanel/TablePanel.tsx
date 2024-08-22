import { PanelProps } from '@grafana/data';
import { ToolbarButton, ToolbarButtonRow, useStyles2 } from '@grafana/ui';
import React, { useEffect, useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { useContentSizes, useSavedState, useTable } from '@/hooks';
import { PanelOptions } from '@/types';

import { Table } from '../Table';
import { getStyles } from './TablePanel.styles';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Table Panel
 */
export const TablePanel: React.FC<Props> = ({ id, data, width, height, options, eventBus }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Current group
   */
  const [currentGroup, setCurrentGroup] = useSavedState<string>({
    key: `volkovlabs.table.panel.${id}`,
    initialValue: options.tables?.[0]?.name || '',
  });

  /**
   * Current Columns
   */
  const currentColumns = useMemo(() => {
    if (options.tables?.length && currentGroup) {
      return options.tables.find((group) => group.name === currentGroup)?.items;
    }
    return;
  }, [options.tables, currentGroup]);

  /**
   * Table
   */
  const { tableData, columns } = useTable({ data, columns: currentColumns });

  /**
   * Change current group if was removed
   */
  useEffect(() => {
    if (!options.tables?.some((group) => group.name === currentGroup)) {
      setCurrentGroup(options.tables?.[0]?.name || '');
    }
  }, [currentGroup, id, options.tables, setCurrentGroup]);

  /**
   * Show selected group first
   */
  const sortedGroups = useMemo(() => {
    if (!options.tables) {
      return [];
    }

    const activeGroup = options.tables.find((group) => group.name === currentGroup);

    /**
     * Selected group is not found
     */
    if (!activeGroup || !options.tabsSorting) {
      return options.tables;
    }

    const withoutActive = options.tables.filter((group) => group.name !== currentGroup);

    return [activeGroup, ...withoutActive];
  }, [currentGroup, options.tables]);

  /**
   * Content Sizes
   */
  const {
    containerRef: scrollableContainerRef,
    tableRef,
    headerRef,
    tableTopOffset,
    tableHeaderRef,
  } = useContentSizes({ height, options, tableData });

  /**
   * Return
   */
  return (
    <div
      {...TEST_IDS.panel.root.apply()}
      className={styles.root}
      style={{
        width,
        height,
      }}
    >
      <div
        ref={scrollableContainerRef}
        className={styles.content}
        style={{
          width,
          height,
        }}
      >
        {sortedGroups.length > 1 && (
          <div ref={headerRef} className={styles.header}>
            <ToolbarButtonRow alignment="left" key={currentGroup} className={styles.toolbar}>
              {sortedGroups.map((group, index) => (
                <ToolbarButton
                  key={group.name}
                  variant={currentGroup === group.name ? 'active' : 'default'}
                  onClick={() => {
                    setCurrentGroup(group.name);
                  }}
                  className={styles.toolbarButton}
                  style={{
                    maxWidth: index === 0 ? width - 60 : undefined,
                  }}
                  {...TEST_IDS.panel.tab.apply(group.name)}
                >
                  {group.name}
                </ToolbarButton>
              ))}
            </ToolbarButtonRow>
          </div>
        )}
        <Table
          data={tableData}
          columns={columns}
          tableRef={tableRef}
          tableHeaderRef={tableHeaderRef}
          topOffset={tableTopOffset}
          scrollableContainerRef={scrollableContainerRef}
          eventBus={eventBus}
        />
      </div>
    </div>
  );
};
