import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    column: css`
      &:not(:last-child) {
        margin-bottom: ${theme.spacing(0.5)};
      }
    `,
    groupField: css`
      &:not(:last-child) {
        margin-bottom: ${theme.spacing(1)};
      }
    `,
  };
};
