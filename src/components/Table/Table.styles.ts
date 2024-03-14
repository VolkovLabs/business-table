import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Get Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  const borderColor = theme.colors.border.weak;

  return {
    root: css`
      width: 100%;
    `,
    header: css`
      border-bottom: 1px solid ${borderColor};
    `,
    headerCell: css`
      padding: ${theme.spacing(0.5, 1)};
    `,
    row: css`
      &:not(:last-child) {
        border-bottom: 1px solid ${borderColor};
      }
    `,
    cell: css`
      padding: ${theme.spacing(0.5, 1)};
      &:not(:last-child) {
        border-right: 1px solid ${borderColor};
      }
    `,
  };
};
