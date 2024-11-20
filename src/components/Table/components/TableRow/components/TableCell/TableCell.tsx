import { css, cx } from '@emotion/css';
import { DataLinksContextMenu, IconButton, useStyles2 } from '@grafana/ui';
import { Cell, CellContext, flexRender, Row } from '@tanstack/react-table';
import React, { useMemo } from 'react';

import { nestedObjectEditorsRegistry } from '@/components';
import { ACTIONS_COLUMN_ID, TEST_IDS } from '@/constants';
import { CellType } from '@/types';

import { getStyles } from './TableCell.styles';

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Cell
   */
  cell: Cell<TData, unknown>;

  /**
   * Renderer props
   */
  rendererProps: CellContext<TData, unknown>;

  /**
   * Row
   */
  row: Row<TData>;
}

/**
 * TableCell
 */
export const TableCell = <TData,>({ row, cell, rendererProps }: Props<TData>) => {
  /**
   * Styles and Theme
   */
  const styles = useStyles2(getStyles);

  /**
   * Links
   */
  const links = useMemo(() => {
    const field = cell.column.columnDef.meta?.field;

    if (!field) {
      return;
    }

    return field.getLinks?.({ valueRowIndex: row.index });
  }, [cell.column.columnDef.meta?.field, row.index]);

  /**
   * Render Cell Content
   */
  const renderCellContent = () => {
    return cell.getIsAggregated()
      ? flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, rendererProps)
      : flexRender(cell.column.columnDef.cell, rendererProps);
  };

  /**
   * Render Cell
   */
  const renderCell = () => {
    /**
     * No content if placeholder
     */
    if (cell.getIsPlaceholder()) {
      return null;
    }

    /**
     * Disable links if group
     */
    if (row.getIsGrouped()) {
      return renderCellContent();
    }

    /**
     * Render Nested Objects
     */
    if (cell.column.columnDef.meta?.config.type === CellType.NESTED_OBJECTS) {
      const value = cell.getValue();
      if (cell.column.columnDef.meta.nestedObjectOptions && Array.isArray(value)) {
        const Control = nestedObjectEditorsRegistry.get(cell.column.columnDef.meta.nestedObjectOptions.type)?.control;

        if (Control) {
          return <Control options={cell.column.columnDef.meta.nestedObjectOptions} value={value} row={row.original} />;
        }
      }
    }

    /**
     *  Do not create links for edit cell with icons
     */
    if (cell.id.includes(ACTIONS_COLUMN_ID)) {
      return renderCellContent();
    }

    /**
     * No Links
     */
    if (!links || links.length === 0) {
      return renderCellContent();
    }

    /**
     * One Link
     */
    return links.length === 1 ? (
      <a
        href={links[0].href}
        onClick={(event) => event.stopPropagation()}
        target={links[0].target}
        title={links[0].title}
        className={styles.link}
        {...TEST_IDS.tableCell.tableLink.apply(links[0].title)}
      >
        {renderCellContent()}
      </a>
    ) : (
      /**
       *  Menu with links
       */
      <DataLinksContextMenu links={() => links}>
        {(api) => (
          <div
            className={cx(
              styles.link,
              css`
                cursor: context-menu;
              `
            )}
            onClick={(event) => {
              api.openMenu!(event);
              event.stopPropagation();
            }}
            {...TEST_IDS.tableCell.tableLinkMenu.apply()}
          >
            {renderCellContent()}
          </div>
        )}
      </DataLinksContextMenu>
    );
  };

  return (
    <>
      {cell.getIsGrouped() && row.getCanExpand() && (
        <IconButton
          name={row.getIsExpanded() ? 'angle-down' : 'angle-right'}
          aria-label={TEST_IDS.table.buttonExpandCell.selector(cell.id)}
          className={styles.expandButton}
        />
      )}
      {renderCell()}
    </>
  );
};
