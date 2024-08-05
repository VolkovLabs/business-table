import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Get Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  const borderColor = theme.colors.border.weak;

  return {
    root: css`
      overflow: auto;
      position: relative;
    `,
    table: css`
      display: grid;
    `,
    header: css`
      border-bottom: 1px solid ${borderColor};
      position: sticky;
      z-index: 100;
      top: 0;
      background-color: ${theme.colors.background.primary};
    `,
    headerRow: css`
      display: flex;
      width: 100%;
    `,
    headerCell: css`
      display: flex;
      min-height: ${theme.spacing(3.5)};
      align-items: center;
      padding: ${theme.spacing(0.75)};
      gap: ${theme.spacing(0.5)};
      flex-wrap: wrap;

      &:not(:last-child) {
        border-right: 1px solid ${borderColor};
      }
    `,
    body: css`
      display: grid;
      position: relative; //needed for absolute positioning of rows
    `,
    row: css`
      display: flex;
      position: absolute;
      width: 100%;
      &:not(:last-child) {
        border-bottom: 1px solid ${borderColor};
      }
    `,
    cell: css`
      display: flex;
      height: ${theme.spacing(4.5)};
      align-items: center;
      white-space: nowrap;
      padding: ${theme.spacing(0.75)};

      &:not(:last-child) {
        border-right: 1px solid ${borderColor};
      }
    `,
    cellExpandable: css`
      cursor: pointer;
      border-right: none !important;
    `,
    expandButton: css`
      margin-right: ${theme.spacing(1)};
    `,
    filterButton: css`
      border: none;
      box-shadow: none;
      background-color: transparent;
      padding: 0;
    `,
    filterPopup: css`
      background-color: ${theme.colors.background.primary};
      padding: ${theme.spacing(1.5)};
      border: 1px solid ${theme.colors.border.weak};
      min-width: 200px;
    `,
    filterPopupLine: css`
      border-top: 1px solid ${theme.colors.border.weak};
      margin: ${theme.spacing(1, 0)};
    `,
    filterPopupFooter: css`
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: ${theme.spacing(0.5)};
    `,
    filterFacetedList: css`
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 200px;
      overflow: auto;
    `,
  };
};
