import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Get Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    filterPopupLine: css`
      border-top: 1px solid ${theme.colors.border.weak};
      margin: ${theme.spacing(1, 0)};
    `,
  };
};
