import { PanelProps } from '@grafana/data';
import { config } from '@grafana/runtime';
import {
  Button,
  ButtonGroup,
  ClickOutsideWrapper,
  Dropdown,
  Icon,
  MenuItem,
  ScrollContainer,
  ToolbarButton,
  ToolbarButtonRow,
  useStyles2,
} from '@grafana/ui';
import { Table as TableInstance } from '@tanstack/react-table';
import { AlertWithDetails } from '@volkovlabs/components';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import semver from 'semver';

import { TEST_IDS } from '@/constants';
import {
  tablePanelContext,
  useContentSizes,
  useExportData,
  useExternalExport,
  usePagination,
  useSavedState,
  useTable,
  useUpdateRow,
} from '@/hooks';
import { ExportFormatType, PanelOptions, TablePreferenceColumn, UserPreferences } from '@/types';
import { checkIfOperationEnabled, getTableWithPreferences, updateUserPreferenceTables } from '@/utils';

import { Table } from '../Table';
import { getStyles } from './TablePanel.styles';

/**
 * Properties
 */
type Props = PanelProps<PanelOptions>;

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
  fieldConfig,
}) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Is Panel Focused
   */
  const isFocused = useRef<boolean>(false);

  /**
   * Should scroll
   */
  const shouldScroll = useRef<boolean>(false);

  /**
   * State
   */
  const [error, setError] = useState('');
  const [downloadFormat, setDownloadFormat] = useState(ExportFormatType.CSV);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  /**
   * Is export formats available
   */
  const isExportAvailable = useMemo(
    () => options.toolbar.exportFormats && !!options.toolbar.exportFormats.length,
    [options.toolbar.exportFormats]
  );

  /**
   * currentDashboardId
   */
  const currentDashboardId = useMemo(() => replaceVariables('${__dashboard.uid}'), [replaceVariables]);

  /**
   * Export format
   * allow to change correct format based on UI select and options change
   */
  const exportFormat = useMemo(() => {
    if (isExportAvailable) {
      if (!downloadFormat) {
        return options.toolbar.exportFormats[0];
      }
      return downloadFormat as ExportFormatType;
    }

    return ExportFormatType.XLSX;
  }, [downloadFormat, isExportAvailable, options.toolbar.exportFormats]);

  /**
   * Current group
   */
  const [currentGroup, setCurrentGroup] = useSavedState<string>({
    key: `volkovlabs.table.panel.${id}.${currentDashboardId}`,
    initialValue: options.tables?.[0]?.name || '',
  });

  /**
   * User Preferences
   */
  const [userPreferences, setUserPreferences] = useSavedState<UserPreferences>({
    key: `volkovlabs.table.panel.${id}.${currentDashboardId}.user.preferences`,
    initialValue: {},
    enabled: options.saveUserPreference,
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
   * Current table wit user preferences
   */
  const tableWithPreferences = useMemo(
    () => getTableWithPreferences(currentTable, userPreferences),
    [currentTable, userPreferences]
  );

  /**
   * Is Add Row Enabled
   */
  const isAddRowEnabled = useMemo(() => {
    if (!currentTable) {
      return false;
    }

    return checkIfOperationEnabled(currentTable.addRow, {
      series: data.series,
      user: config.bootData.user,
    });
  }, [currentTable, data.series]);

  /**
   * Is Delete Row Enabled
   */
  const isDeleteRowEnabled = useMemo(() => {
    if (!currentTable) {
      return false;
    }

    return checkIfOperationEnabled(currentTable.deleteRow, {
      series: data.series,
      user: config.bootData.user,
    });
  }, [currentTable, data.series]);

  /**
   * Table
   */
  const { tableData, columns } = useTable({
    data,
    columns: tableWithPreferences?.items,
    actionsColumnConfig: currentTable?.actionsColumnConfig,
    rowHighlightConfig: currentTable?.rowHighlight,
    isAddRowEnabled,
    isDeleteRowEnabled,
    replaceVariables,
    objects: options.nestedObjects,
    eventBus,
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
    return (
      sortedGroups.length > 1 ||
      options.toolbar.export ||
      options.isColumnManagerAvailable ||
      isExportAvailable ||
      options.externalExport?.enabled
    );
  }, [
    sortedGroups.length,
    options.toolbar.export,
    options.isColumnManagerAvailable,
    options.externalExport?.enabled,
    isExportAvailable,
  ]);

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
    tableFooterRef,
    scrollPaddingEnd,
  } = useContentSizes({ width, height, options, tableData, rowHighlightConfig: currentTable?.rowHighlight });

  /**
   * Add Row
   */
  const onAddRow = useUpdateRow({ replaceVariables, currentTable, operation: 'add', setError });

  /**
   * Update Row
   */
  const onUpdateRow = useUpdateRow({ replaceVariables, currentTable, operation: 'update', setError });

  /**
   * Delete Row
   */
  const onDeleteRow = useUpdateRow({ replaceVariables, currentTable, operation: 'delete', setError });

  /**
   * Export
   */
  const onExport = useExportData({
    data: tableData,
    columns,
    tableConfig: currentTable,
    panelTitle: title,
    exportFormat: exportFormat,
    replaceVariables,
  });

  /**
   * Export
   */
  const onExternalExport = useExternalExport({
    data: tableData,
    columns,
    externalExport: options.externalExport,
    replaceVariables,
    setError,
  });

  const exportFormatsMenu = useMemo(() => {
    return (
      <>
        {options?.toolbar?.exportFormats?.map((exportformat) => {
          return (
            <MenuItem
              key={exportformat}
              label={exportformat}
              onClick={() => setDownloadFormat(exportformat)}
              className={styles.menuItem}
              ariaLabel={`Set ${exportformat} format`}
              {...TEST_IDS.panel.buttonSetFormat.apply(exportformat)}
            />
          );
        })}
      </>
    );
  }, [options?.toolbar?.exportFormats, styles.menuItem]);

  /**
   * On after scroll
   */
  const onAfterScroll = useCallback(() => {
    shouldScroll.current = false;
  }, []);

  /**
   * Table Panel content
   */
  const panelContent = () => {
    return (
      <>
        {!!error && (
          <AlertWithDetails details={error} variant="error" title="Request error" onRemove={() => setError('')} />
        )}
        {isToolbarVisible && (
          <div ref={headerRef} className={styles.header}>
            <ToolbarButtonRow alignment={options.toolbar.alignment} key={currentGroup} className={styles.tabs}>
              {options.isColumnManagerAvailable && currentTable && sortedGroups.length === 1 && (
                <>
                  {replaceVariables(currentTable.name)}
                  <Icon
                    className={styles.drawerButton}
                    name="table"
                    aria-label="open-drawer"
                    onClick={() => setDrawerOpen(true)}
                    size="xl"
                    {...TEST_IDS.panel.buttonOpenDrawer.apply(currentTable?.name)}
                  />
                </>
              )}
              {sortedGroups.length > 1 &&
                sortedGroups.map((group, index) => (
                  <ToolbarButton
                    key={group.name}
                    variant={currentGroup === group.name ? 'active' : 'default'}
                    onClick={() => {
                      setCurrentGroup(group.name);
                      shouldScroll.current = true;
                    }}
                    className={styles.tabButton}
                    style={{
                      maxWidth: index === 0 ? width - 60 : undefined,
                    }}
                    {...TEST_IDS.panel.tab.apply(group.name)}
                  >
                    {replaceVariables(group.name)}
                    {options.isColumnManagerAvailable && currentGroup === group.name && (
                      <Icon
                        className={styles.drawerButton}
                        name="table"
                        aria-label="open-drawer"
                        onClick={() => setDrawerOpen(true)}
                        size="xl"
                        {...TEST_IDS.panel.buttonOpenDrawer.apply(group.name)}
                      />
                    )}
                  </ToolbarButton>
                ))}
              {isExportAvailable && (
                <ButtonGroup className={styles.downloadButtons}>
                  <Button
                    icon="download-alt"
                    onClick={() => onExport({ table: tableInstance.current as never })}
                    variant="secondary"
                    size="sm"
                    {...TEST_IDS.panel.buttonDownload.apply()}
                  >
                    Download
                  </Button>
                  <Dropdown overlay={exportFormatsMenu} {...TEST_IDS.panel.dropdown.apply()}>
                    <Button variant="secondary" size="sm" icon="angle-down" {...TEST_IDS.panel.buttonFormat.apply()}>
                      {exportFormat}
                    </Button>
                  </Dropdown>
                </ButtonGroup>
              )}
              {options.externalExport?.enabled && (
                <Button
                  icon="file-download"
                  onClick={() => onExternalExport({ table: tableInstance.current as never })}
                  variant="secondary"
                  size="sm"
                  {...TEST_IDS.panel.buttonExport.apply()}
                >
                  Export
                </Button>
              )}
            </ToolbarButtonRow>
          </div>
        )}
        <Table
          key={currentTable?.name}
          expandedByDefault={currentTable?.expanded ?? false}
          data={tableData}
          columns={columns}
          tableRef={tableRef}
          tableHeaderRef={tableHeaderRef}
          topOffset={tableTopOffset}
          tableFooterRef={tableFooterRef}
          scrollPaddingEnd={scrollPaddingEnd}
          scrollableContainerRef={scrollableContainerRef}
          eventBus={eventBus}
          onUpdateRow={onUpdateRow}
          bottomOffset={tableBottomOffset}
          paginationRef={paginationRef}
          showHeader={currentTable?.showHeader ?? true}
          stripedRows={currentTable?.stripedRows ?? false}
          width={width}
          pagination={pagination}
          tableInstance={tableInstance as never}
          onAddRow={onAddRow}
          isAddRowEnabled={isAddRowEnabled}
          onDeleteRow={onDeleteRow}
          isDeleteRowEnabled={isDeleteRowEnabled}
          rowHighlightConfig={currentTable?.rowHighlight}
          isFocused={isFocused}
          shouldScroll={shouldScroll}
          scrollBehavior={currentTable?.rowHighlight.smooth ? 'smooth' : 'auto'}
          onAfterScroll={onAfterScroll}
          isDrawerOpen={isDrawerOpen}
          currentTableName={currentTable?.name}
          setDrawerOpen={setDrawerOpen}
          drawerColumns={tableWithPreferences?.items}
          userPreferences={userPreferences}
          updateTablesPreferences={(tableName: string, updatedColumns: TablePreferenceColumn[]) => {
            setUserPreferences({
              ...userPreferences,
              tables: updateUserPreferenceTables(tableName, userPreferences, updatedColumns),
            });
          }}
          clearPreferences={() => {
            setUserPreferences({});
          }}
          replaceVariables={replaceVariables}
          advancedSettings={{
            isColumnManagerAvailable: options.isColumnManagerAvailable,
            showFiltersInColumnManager: options.showFiltersInColumnManager,
            saveUserPreference: options.saveUserPreference,
            showSortInColumnManager: options.showSortingInColumnManager,
          }}
        />
      </>
    );
  };

  if (!data.series.length) {
    return (
      <div className={styles.noDataMessage} {...TEST_IDS.panel.noDataMessage.apply()}>
        {fieldConfig.defaults?.noValue || 'No Value. You can change the text using the Standard options'}
      </div>
    );
  }

  /**
   * Return
   */
  return (
    <ClickOutsideWrapper
      onClick={() => {
        if (isFocused.current) {
          isFocused.current = false;
        }
      }}
      useCapture={true}
    >
      <tablePanelContext.Provider value={{ replaceVariables, setError }}>
        <div
          {...TEST_IDS.panel.root.apply()}
          className={styles.root}
          style={{
            width,
            height,
          }}
          onMouseDown={() => {
            isFocused.current = true;
          }}
        >
          {semver.lt(config.buildInfo.version, '11.5.0') ? (
            <div
              ref={scrollableContainerRef}
              className={styles.content}
              style={{
                width,
                height,
              }}
              {...TEST_IDS.panel.defaultScrollContainer.apply()}
            >
              {panelContent()}
            </div>
          ) : (
            <ScrollContainer height={height} ref={scrollableContainerRef} {...TEST_IDS.panel.scrollContainer.apply()}>
              {panelContent()}
            </ScrollContainer>
          )}
        </div>
      </tablePanelContext.Provider>
    </ClickOutsideWrapper>
  );
};
