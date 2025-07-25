import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    item: css`
      margin-bottom: ${theme.spacing(1)};
    `,
    container: css`
      width: 100%;
    `,
  };
};
