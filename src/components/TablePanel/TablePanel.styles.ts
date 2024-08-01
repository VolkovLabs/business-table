import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    root: css`
      position: relative;
    `,
    content: css`
      overflow: auto;
    `,
    header: css`
      position: sticky;
      top: 0;
      background-color: ${theme.colors.background.primary};
      z-index: 120;
      min-width: 100%;
      left: 0;
    `,
    toolbar: css`
      div > div {
        flex-direction: column;
        max-width: 100%;
      }
      padding: 0;
      border-bottom: 1px solid ${theme.colors.border.weak};
    `,
    toolbarButton: css`
      overflow: hidden;
      max-width: 100%;

      > div {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  };
};
