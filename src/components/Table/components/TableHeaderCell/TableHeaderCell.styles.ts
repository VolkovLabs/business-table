import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Get Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    labelSortable: css`
      cursor: pointer;
    `,
    actionHeader: css`
      margin: ${theme.spacing(0)};
      margin-left: ${theme.spacing(1)};
    `,
    actions: css`
      display: flex;
    `,
    tooltip: css`
      margin-right: ${theme.spacing(0.5)};
    `,
    filterButton: css`
      border: none;
      box-shadow: none;
      background-color: transparent;
      padding: 0;
    `,
  };
};
