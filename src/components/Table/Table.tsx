import { cx } from '@emotion/css';
import { EventBus, GrafanaTheme2 } from '@grafana/data';
import { ConfirmModal, Pagination, useStyles2, useTheme2 } from '@grafana/ui';
import {
  Column,
  ColumnDef,
  ColumnPinningState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Table as TableInstance,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { get } from 'lodash';
import React, { CSSProperties, MutableRefObject, RefObject, useCallback, useEffect, useMemo, useState } from 'react';

import { ButtonSelect } from '@/components';
import { PAGE_SIZE_OPTIONS, ROW_HIGHLIGHT_STATE_KEY, TEST_IDS } from '@/constants';
import {
  ColumnHeaderFontSize,
  ColumnPinDirection,
  Pagination as PaginationOptions,
  RowHighlightConfig,
  ScrollToRowPosition,
} from '@/types';
import { getFirstHighlightedRowIndex } from '@/utils';

import { TableHeaderCell, TableRow } from './components';
import { useAddData, useDeleteData, useEditableData, useSortState, useSyncedColumnFilters } from './hooks';
import { getStyles } from './Table.styles';

/**
 * Default Column Sizing
 */
const defaultColumnSizing = {
  size: 50,
  minSize: 20,
  maxSize: Number.MAX_SAFE_INTEGER,
};

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Data
   */
  data: TData[];

  /**
   * Table's columns definition. Must be memoized.
   */
  columns: Array<ColumnDef<TData>>;

  /**
   * Table Ref
   */
  tableRef?: RefObject<HTMLTableElement>;

  /**
   * Table Header Ref
   */
  tableHeaderRef: RefObject<HTMLTableSectionElement>;

  /**
   * Top Offset
   *
   * @type {number}
   */
  topOffset?: number;

  /**
   * Table Header Ref
   */
  paginationRef: RefObject<HTMLDivElement>;

  /**
   * Bottom Offset
   *
   * @type {number}
   */
  bottomOffset?: number;

  /**
   * Scrollable Container Ref
   */
  scrollableContainerRef: RefObject<HTMLDivElement>;

  /**
   * Event Bus
   *
   * @type {EventBus}
   */
  eventBus: EventBus;

  /**
   * Update Row
   */
  onUpdateRow: (row: TData) => Promise<void>;

  /**
   * Width
   *
   * @type {number}
   */
  width: number;

  /**
   * Pagination
   *
   * @type {PaginationOptions}
   */
  pagination: PaginationOptions;

  /**
   * Table Instance
   *
   * @type {MutableRefObject<TableInstance<TData>>}
   */
  tableInstance: MutableRefObject<TableInstance<TData>>;

  /**
   * Expanded By default
   *
   * @type {boolean}
   */
  expandedByDefault: boolean;

  /**
   * Show Header
   *
   * @type {boolean}
   */
  showHeader: boolean;

  /**
   * Add Row
   */
  onAddRow: (row: TData) => Promise<void>;

  /**
   * Is Add Row Enabled
   *
   * @type {boolean}
   */
  isAddRowEnabled: boolean;

  /**
   * Delete Row
   */
  onDeleteRow: (row: TData) => Promise<void>;

  /**
   * Is Add Row Enabled
   *
   * @type {boolean}
   */
  isDeleteRowEnabled: boolean;

  /**
   * Row Highlight Config
   *
   * @type {RowHighlightConfig}
   */
  rowHighlightConfig?: RowHighlightConfig;

  /**
   * Is Panel Focused
   */
  isFocused: RefObject<boolean>;

  /**
   * Should scroll
   */
  shouldScroll: RefObject<boolean>;

  /**
   * Function to call after auto scroll
   */
  onAfterScroll: () => void;
}

/**
 * Get Pinned Header Column Style
 */
const getPinnedHeaderColumnStyle = <TData,>(theme: GrafanaTheme2, column: Column<TData>): CSSProperties => {
  const pinnedPosition = column.getIsPinned();
  if (!pinnedPosition) {
    return {};
  }

  const isFirstRightPinnedColumn = pinnedPosition === 'right' && column.getIsFirstColumn('right');

  return {
    boxShadow: isFirstRightPinnedColumn ? `-1px 0 ${theme.colors.border.weak}` : undefined,
    left: pinnedPosition === 'left' ? `${column.getStart('left')}px` : undefined,
    right: pinnedPosition === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: 'sticky',
    zIndex: 1,
    backgroundColor: theme.colors.background.primary,
  };
};

/**
 * Get Pinned Footer Column Style
 */
const getPinnedFooterColumnStyle = <TData,>(theme: GrafanaTheme2, column: Column<TData>): CSSProperties => {
  const pinnedPosition = column.getIsPinned();
  if (!pinnedPosition) {
    return {};
  }

  const isFirstRightPinnedColumn = pinnedPosition === 'right' && column.getIsFirstColumn('right');

  return {
    boxShadow: isFirstRightPinnedColumn ? `-1px 0 ${theme.colors.border.weak}` : undefined,
    left: pinnedPosition === 'left' ? `${column.getStart('left')}px` : undefined,
    right: pinnedPosition === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: 'sticky',
    zIndex: 1,
    backgroundColor: theme.colors.background.canvas,
  };
};

/**
 * Test Ids
 */
export const testIds = TEST_IDS.table;

/**
 * Table
 */
export const Table = <TData,>({
  data,
  columns,
  scrollableContainerRef,
  tableHeaderRef,
  tableRef,
  topOffset,
  eventBus,
  onUpdateRow,
  bottomOffset,
  paginationRef,
  width,
  pagination,
  tableInstance,
  expandedByDefault,
  showHeader,
  onAddRow,
  isAddRowEnabled,
  isDeleteRowEnabled,
  onDeleteRow,
  rowHighlightConfig,
  shouldScroll,
  isFocused,
  onAfterScroll,
}: Props<TData>) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = useStyles2(getStyles);

  /**
   * Grouping
   */
  const grouping = useMemo(() => {
    return columns.filter((column) => column.enableGrouping).map((columnWithGrouping) => columnWithGrouping.id || '');
  }, [columns]);

  /**
   * Column Pinning
   */
  const columnPinning = useMemo((): ColumnPinningState => {
    const pinnedColumn = columns.filter((column) => column.enablePinning);
    return pinnedColumn.reduce(
      (acc, column) => {
        if (column.meta?.config.pin === ColumnPinDirection.LEFT) {
          acc.left?.push(column.id || '');
        } else {
          acc.right?.push(column.id || '');
        }

        return acc;
      },
      { left: [], right: [] } as ColumnPinningState
    );
  }, [columns]);

  /**
   * Is Edit Row Enabled
   */
  const isEditRowEnabled = useMemo((): boolean => {
    return columns.some((column) => column.meta?.editable);
  }, [columns]);

  /**
   * Expanded
   */
  const [expanded, setExpanded] = useState<ExpandedState>(expandedByDefault ? true : {});

  /**
   * Filtering
   */
  const [columnFilters, setColumnFilters] = useSyncedColumnFilters({ columns, eventBus });

  /**
   * Sorting
   */
  const { sorting, onChangeSort } = useSortState({ columns });

  /**
   * React Table
   */
  const table = useReactTable({
    state: {
      grouping,
      expanded,
      columnFilters,
      sorting,
      pagination: pagination.value,
      columnPinning,
    },

    /**
     * Basic
     */
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    /**
     * Grouping
     */
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableExpanding: true,
    enableGrouping: true,
    onExpandedChange: setExpanded,
    autoResetExpanded: false,

    /**
     * Filtering
     */
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    /**
     * Sorting
     */
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: onChangeSort,
    enableSorting: true,

    /**
     * Pagination
     */
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: pagination.onChange,
    manualPagination: pagination.isManual,

    /**
     * Debug
     */
    debugTable: false,
    debugColumns: false,

    /**
     * Defaults
     */
    defaultColumn: defaultColumnSizing,
  });

  /**
   * Rows
   */
  const { rows } = table.getRowModel();

  /**
   * Row Virtualizer
   * Options description - https://tanstack.com/virtual/v3/docs/api/virtualizer
   */
  const rowVirtualizer = useVirtualizer({
    getScrollElement: useCallback(() => scrollableContainerRef.current, [scrollableContainerRef]),
    count: rows.length,
    getItemKey: useCallback((index: number) => rows[index].id, [rows]),
    estimateSize: useCallback(() => 37, []),
    measureElement: useCallback((el: HTMLElement | HTMLTableRowElement) => el.offsetHeight, []),
    overscan: 10,
  });

  /**
   * Virtualized instance options
   */
  const virtualRows = rowVirtualizer.getVirtualItems();

  /**
   * Is Footer Visible
   */
  const isFooterVisible = useMemo(() => {
    return columns.some((column) => !!column.meta?.footerEnabled);
  }, [columns]);

  /**
   * Add Data
   */
  const addData = useAddData({ table, onAddRow });

  /**
   * Editable Data
   */
  const editableData = useEditableData({ table, onUpdateRow });

  /**
   * Delete Data
   */
  const deleteData = useDeleteData({ onDeleteRow });

  /**
   * Set table instance
   */
  useEffect(() => {
    tableInstance.current = table;
  }, [table, tableInstance]);

  /**
   * Get first visible highlighted row index from only visible rows
   */
  const firstHighlightedRowIndex = useMemo(() => getFirstHighlightedRowIndex(rows), [rows]);

  /**
   * Scroll To Highlighted Row
   */
  const scrollTo = rowHighlightConfig?.enabled ? rowHighlightConfig.scrollTo : ScrollToRowPosition.NONE;

  /**
   * Auto scroll
   * https://tanstack.com/virtual/v3/docs/api/virtualizer#scrolltoindex
   */
  useEffect(() => {
    if (
      scrollTo !== ScrollToRowPosition.NONE &&
      data &&
      (!isFocused.current || shouldScroll.current) &&
      firstHighlightedRowIndex >= 0
    ) {
      rowVirtualizer.scrollToIndex(firstHighlightedRowIndex, { align: scrollTo });
      onAfterScroll();
    }
  }, [scrollTo, firstHighlightedRowIndex, data, rowVirtualizer, rows, isFocused, shouldScroll, onAfterScroll]);

  return (
    <>
      <table
        className={styles.table}
        ref={tableRef}
        style={{
          width: table.getCenterTotalSize(),
        }}
        {...testIds.root.apply()}
      >
        {showHeader && (
          <thead className={styles.header} ref={tableHeaderRef} style={{ top: topOffset }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={styles.headerRow} {...testIds.headerRow.apply(headerGroup.id)}>
                {headerGroup.headers.map((header) => {
                  const bgColor = header.column.columnDef.meta?.config.appearance.header.backgroundColor;
                  const fontSize =
                    header.column.columnDef.meta?.config.appearance.header.fontSize || ColumnHeaderFontSize.MD;
                  return (
                    <th
                      key={header.id}
                      className={cx(styles.headerCell, {
                        [styles.sizeLg]: fontSize === ColumnHeaderFontSize.LG,
                        [styles.sizeMd]: fontSize === ColumnHeaderFontSize.MD,
                        [styles.sizeSm]: fontSize === ColumnHeaderFontSize.SM,
                        [styles.sizeXs]: fontSize === ColumnHeaderFontSize.XS,
                      })}
                      style={{
                        maxWidth: header.column.columnDef.maxSize,
                        minWidth: header.column.columnDef.minSize,
                        background: bgColor,
                        width: header.getSize(),
                        textAlign: header.column.columnDef.meta?.config.appearance.alignment,
                        justifyContent: header.column.columnDef.meta?.config.appearance.alignment,
                        ...getPinnedHeaderColumnStyle(theme, header.column),
                      }}
                      {...testIds.headerCell.apply(header.id)}
                    >
                      <TableHeaderCell
                        header={header}
                        size={fontSize}
                        isAddRowEnabled={isAddRowEnabled}
                        onAddRow={addData.onStart}
                      />
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
        )}
        {!!addData.row && (
          <tbody {...testIds.newRowContainer.apply()}>
            <TableRow
              row={addData.row}
              editingRow={addData.row}
              onStartEdit={addData.onStart}
              onCancelEdit={addData.onCancel}
              onChange={addData.onChange}
              onSave={addData.onSave}
              isSaving={addData.isSaving}
              isNewRow={true}
              onDelete={deleteData.onStart}
              isHighlighted={false}
            />
          </tbody>
        )}
        <tbody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
          }}
          className={styles.body}
          {...testIds.body.apply()}
        >
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const isHighlighted =
              rowHighlightConfig?.enabled === true && get(row.original, ROW_HIGHLIGHT_STATE_KEY) === true;

            return (
              <TableRow
                key={row.id}
                row={row}
                virtualRow={virtualRow}
                rowVirtualizer={rowVirtualizer}
                editingRow={editableData.row?.id === row.id ? editableData.row : null}
                onStartEdit={editableData.onStartEdit}
                onCancelEdit={editableData.onCancelEdit}
                onChange={editableData.onChange}
                onSave={editableData.onSave}
                isSaving={editableData.isSaving}
                isEditRowEnabled={isEditRowEnabled}
                isDeleteRowEnabled={isDeleteRowEnabled}
                onDelete={deleteData.onStart}
                rowHighlightConfig={rowHighlightConfig}
                isHighlighted={editableData.row?.id !== row.id && isHighlighted}
              />
            );
          })}
        </tbody>
        {isFooterVisible && (
          <tfoot className={styles.footer} style={{ maxHeight: rowVirtualizer.getTotalSize(), bottom: bottomOffset }}>
            {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id} className={styles.footerRow}>
                {footerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={styles.footerCell}
                    style={{
                      maxWidth: header.column.columnDef.maxSize,
                      minWidth: header.column.columnDef.minSize,
                      width: header.getSize(),
                      textAlign: header.column.columnDef.meta?.config.appearance.alignment,
                      justifyContent: header.column.columnDef.meta?.config.appearance.alignment,
                      ...getPinnedFooterColumnStyle(theme, header.column),
                    }}
                    {...testIds.footerCell.apply(header.id)}
                  >
                    {flexRender(header.column.columnDef.footer, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        )}
      </table>
      {pagination.isEnabled && (
        <div
          className={styles.paginationRow}
          ref={paginationRef}
          style={{ width: table.getCenterTotalSize() }}
          {...testIds.pagination.apply()}
        >
          <Pagination
            currentPage={pagination.value.pageIndex + 1}
            numberOfPages={
              pagination.isManual ? Math.ceil(pagination.total / pagination.value.pageSize) : table.getPageCount()
            }
            onNavigate={(pageNumber) => {
              pagination.onChange({
                ...pagination.value,
                pageIndex: pageNumber - 1,
              });
            }}
            className={styles.pagination}
            showSmallVersion={width <= 200}
            {...testIds.fieldPageNumber.apply()}
          />
          <ButtonSelect
            options={PAGE_SIZE_OPTIONS}
            value={{ value: pagination.value.pageSize }}
            onChange={(event) => {
              pagination.onChange({
                pageIndex: 0,
                pageSize: event.value!,
              });
            }}
            {...testIds.fieldPageSize.apply()}
          />
        </div>
      )}
      {!!deleteData.row && (
        <ConfirmModal
          isOpen={true}
          title="Delete Row"
          body="Please confirm to delete row"
          confirmText="Confirm"
          onConfirm={deleteData.onSave}
          onDismiss={deleteData.onCancel}
          disabled={deleteData.isSaving}
        />
      )}
    </>
  );
};
