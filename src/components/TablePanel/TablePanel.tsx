import { PanelProps } from '@grafana/data';
import { Button, ToolbarButton, ToolbarButtonRow, useStyles2 } from '@grafana/ui';
import { Table as TableInstance } from '@tanstack/react-table';
import React, { useEffect, useMemo, useRef } from 'react';

import { TEST_IDS } from '@/constants';
import { useContentSizes, useExportData, usePagination, useSavedState, useTable, useUpdateRow } from '@/hooks';
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
export const TablePanel: React.FC<Props> = ({
  id,
  data,
  width,
  height,
  options,
  eventBus,
  replaceVariables,
  title,
}) => {
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
   * Current Table
   */
  const currentTable = useMemo(() => {
    if (options.tables?.length && currentGroup) {
      return options.tables.find((group) => group.name === currentGroup);
    }
    return;
  }, [options.tables, currentGroup]);

  /**
   * Table
   */
  const { tableData, columns } = useTable({
    data,
    columns: currentTable?.items,
    replaceVariables,
    objects: options.nestedObjects,
  });

  /**
   * Table Instance
   */
  const tableInstance = useRef<TableInstance<(typeof tableData)[0]>>(null);

  /**
   * Pagination
   */
  const pagination = usePagination({
    paginationConfig: currentTable?.pagination,
    eventBus,
    data: data.series,
  });
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
  }, [currentGroup, options.tables, options.tabsSorting]);

  /**
   * Is Toolbar Visible
   */
  const isToolbarVisible = useMemo(() => {
    return sortedGroups.length > 1 || options.toolbar.export;
  }, [options.toolbar.export, sortedGroups.length]);

  /**
   * Content Sizes
   */
  const {
    containerRef: scrollableContainerRef,
    tableRef,
    headerRef,
    tableTopOffset,
    tableHeaderRef,
    paginationRef,
    tableBottomOffset,
  } = useContentSizes({ width, height, options, tableData });

  /**
   * Update Row
   */
  const onUpdateRow = useUpdateRow({ replaceVariables, currentTable });

  /**
   * Export
   */
  const onExport = useExportData({ data: tableData, columns, tableConfig: currentTable, panelTitle: title });

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
        {isToolbarVisible && (
          <div ref={headerRef} className={styles.header}>
            <ToolbarButtonRow alignment="left" key={currentGroup} className={styles.tabs}>
              {sortedGroups.length > 1 &&
                sortedGroups.map((group, index) => (
                  <ToolbarButton
                    key={group.name}
                    variant={currentGroup === group.name ? 'active' : 'default'}
                    onClick={() => {
                      setCurrentGroup(group.name);
                    }}
                    className={styles.tabButton}
                    style={{
                      maxWidth: index === 0 ? width - 60 : undefined,
                    }}
                    {...TEST_IDS.panel.tab.apply(group.name)}
                  >
                    {group.name}
                  </ToolbarButton>
                ))}
              {options.toolbar.export && (
                <Button
                  icon="download-alt"
                  onClick={() => onExport({ table: tableInstance.current as never })}
                  variant="secondary"
                  size="sm"
                  {...TEST_IDS.panel.buttonDownload.apply()}
                >
                  Download
                </Button>
              )}
            </ToolbarButtonRow>
          </div>
        )}
        <Table
          key={currentTable?.name}
          data={tableData}
          columns={columns}
          tableRef={tableRef}
          tableHeaderRef={tableHeaderRef}
          topOffset={tableTopOffset}
          scrollableContainerRef={scrollableContainerRef}
          eventBus={eventBus}
          onUpdateRow={onUpdateRow}
          bottomOffset={tableBottomOffset}
          paginationRef={paginationRef}
          width={width}
          pagination={pagination}
          tableInstance={tableInstance as never}
        />
      </div>
    </div>
  );
};
