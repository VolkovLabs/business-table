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
      height: ${theme.spacing(3.5)};
      align-items: center;
      padding: ${theme.spacing(0.75)};
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
  };
};
