import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    titleWrapper: css`
      display: flex;
      align-items: center;
      flex-grow: 1;
      cursor: pointer;
      overflow: hidden;
      margin-right: ${theme.spacing(0.5)};
    `,
    title: css`
      font-weight: ${theme.typography.fontWeightBold};
      color: ${theme.colors.text.secondary};
      margin-left: ${theme.spacing(0.5)};
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      gap: ${theme.spacing(0.5)};
      align-items: center;
    `,
  };
};
