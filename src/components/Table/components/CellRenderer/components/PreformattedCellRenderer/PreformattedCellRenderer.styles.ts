import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    default: css`
      padding: ${theme.spacing(0)};
      margin: ${theme.spacing(0)};
      border: none;
      font-family: inherit;
      font-size: inherit;
    `,
    preformatted: css`
      width: 100%;
    `,
  };
};
