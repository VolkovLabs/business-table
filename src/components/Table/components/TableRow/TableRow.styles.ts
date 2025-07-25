import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Get Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  const borderColor = theme.colors.border.weak;
  const hoverBackground = theme.colors.background.secondary;
  const hoverContrastColor = theme.colors.getContrastText(hoverBackground);

  return {
    row: css`
      display: flex;
      position: absolute;
      width: 100%;
      justify-content: space-between;
      &:not(:last-child) {
        border-bottom: 1px solid ${borderColor};
      }
    `,
    highlightRow: css`
      &:hover td {
        background-color: ${hoverBackground}!important;
      }
      &:hover td span {
        color: ${hoverContrastColor} !important;
      }
    `,

    newRow: css`
      position: relative;
      border-bottom: 1px solid ${borderColor};
      background-color: ${theme.colors.background.canvas};
    `,
    cell: css`
      display: flex;
      min-height: ${theme.spacing(4.5)};
      align-items: center;
      white-space: wrap;
      padding: ${theme.spacing(0.75)};
      flex: auto;
      overflow: hidden;
      text-overflow: ellipsis;
      z-index: 0;

      &:not(:last-child) {
        border-right: 1px solid ${borderColor};
      }
    `,
    cellEditable: css`
      &:hover {
        box-shadow: ${theme.colors.primary.border} 0 0 2px;
      }
    `,
    cellExpandable: css`
      cursor: pointer;
      border-right: none !important;
    `,
    expandButton: css`
      margin-right: ${theme.spacing(1)};
    `,
  };
};
