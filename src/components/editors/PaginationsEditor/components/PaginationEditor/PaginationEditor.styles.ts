import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    paginationSection: css`
      padding: ${theme.spacing(0.5, 1)};
    `,
  };
};
