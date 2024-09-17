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
      min-width: 100%;
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
      justify-content: space-between;
    `,
    headerCell: css`
      display: flex;
      min-height: ${theme.spacing(3.5)};
      align-items: center;
      padding: ${theme.spacing(0.75)};
      gap: ${theme.spacing(0.5)};
      flex-wrap: wrap;
      flex: auto;

      &:not(:last-child) {
        border-right: 1px solid ${borderColor};
      }
    `,
    body: css`
      display: grid;
      position: relative; //needed for absolute positioning of rows
    `,
    footer: css`
      position: sticky;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-top: 1px solid ${borderColor};
      overflow: auto;
    `,
    footerRow: css`
      display: flex;
      width: 100%;
      justify-content: space-between;
      background-color: ${theme.colors.background.canvas};
    `,
    footerCell: css`
      display: flex;
      min-height: ${theme.spacing(3.5)};
      align-items: center;
      padding: ${theme.spacing(0.75)};
      gap: ${theme.spacing(0.5)};
      flex-wrap: wrap;
      flex: auto;

      &:not(:last-child) {
        border-right: 1px solid ${borderColor};
      }
    `,
    paginationRow: css`
      z-index: 200;
      background-color: ${theme.colors.background.primary};
      position: sticky;
      bottom: 0;
      left: 0;
      min-width: 100%;
      display: flex;
      justify-content: center;
      padding-top: ${theme.spacing(1)};
      gap: ${theme.spacing(1)};
      align-items: center;
    `,
    pagination: css`
      float: none;
      li {
        margin-bottom: 0;
      }
    `,
  };
};
