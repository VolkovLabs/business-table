import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css({
      position: 'relative',
      display: 'inline-flex',
    }),
    menuWrapper: css({
      zIndex: theme.zIndex.dropdown,
    }),
  };
};
