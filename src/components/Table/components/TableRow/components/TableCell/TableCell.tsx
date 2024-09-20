import { css, cx } from '@emotion/css';
import { Field, LinkModel } from '@grafana/data';
import { DataLinksContextMenu, IconButton, useStyles2 } from '@grafana/ui';
import { Cell, CellContext, flexRender, Row } from '@tanstack/react-table';
import React, { useCallback, useMemo } from 'react';

import { ACTIONS_COLUMN_ID, TEST_IDS } from '@/constants';

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
   * Links
   */
  links: Array<LinkModel<Field>>;

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
export const TableCell = <TData,>({ links, row, cell, rendererProps }: Props<TData>) => {
  /**
   * Styles and Theme
   */
  const styles = useStyles2(getStyles);

  const renderCell = useCallback(() => {
    return cell.getIsAggregated()
      ? flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, rendererProps)
      : flexRender(cell.column.columnDef.cell, rendererProps);
  }, [cell, rendererProps]);

  const dataLinks = useMemo(() => {
    /**
     *  Do not create links for edit cell with icons
     */
    if (cell.id.includes(ACTIONS_COLUMN_ID)) {
      return renderCell();
    }

    /**
     *  One Link
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
        {renderCell()}
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
            {renderCell()}
          </div>
        )}
      </DataLinksContextMenu>
    );
  }, [cell.id, links, renderCell, styles.link]);

  return (
    <>
      {cell.getIsGrouped() && (
        <IconButton
          name={row.getIsExpanded() ? 'angle-down' : 'angle-right'}
          aria-label={TEST_IDS.table.buttonExpandCell.selector(cell.id)}
          className={styles.expandButton}
        />
      )}
      {cell.getIsPlaceholder() ? null : !!links.length ? dataLinks : renderCell()}
    </>
  );
};
