import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    border: css`
      padding: ${theme.spacing(0.5)};
      background: ${theme.colors.background.primary};
      border-radius: ${theme.shape.radius.default};
    `,
    errorIcon: css`
      color: ${theme.colors.error.main};
    `,
    root: css`
      width: 100%;
      word-break: normal;
    `,
  };
};
