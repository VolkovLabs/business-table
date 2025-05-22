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
      cursor: auto;
    `,
    sortingAvailable: css`
      margin-right: ${theme.spacing(0.5)};
      cursor: auto;
    `,
    filterButton: css`
      border: none;
      box-shadow: none;
      background-color: transparent;
      padding: 0;
    `,
    sortTag: css`
      padding: ${theme.spacing(0.25)};
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: ${theme.shape.radius.circle};
      margin-right: ${theme.spacing(0.5)};
      background: ${theme.colors.border.weak};
    `,
  };
};
