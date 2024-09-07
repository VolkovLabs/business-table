import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Get Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  const borderColor = theme.colors.border.weak;

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
    cell: css`
      display: flex;
      min-height: ${theme.spacing(4.5)};
      align-items: center;
      white-space: wrap;
      padding: ${theme.spacing(0.75)};
      flex: auto;
      overflow: hidden;
      text-overflow: ellipsis;

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
