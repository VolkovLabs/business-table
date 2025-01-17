import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2, rows = 20) => {
  return {
    preformatted: css`
      background: inherit;
      width: 100%;
      border: 1px solid ${theme.colors.secondary.border};
      padding: ${theme.spacing(0, 1.5)};
      margin: ${theme.spacing(0)};
      flex: 1;
      overflow: hidden;
      line-height: ${theme.spacing(2)};
      max-height: calc(${rows} * ${theme.spacing(2)});
      text-overflow: ellipsis;
    `,
    errorIcon: css`
      color: ${theme.colors.error.main};
    `,
    cellWrap: css`
      width: 100%;
      display: flex;
      flex-direction: column;
    `,
    cellContent: css`
      width: 100%;
      display: flex;
      flex-direction: row;
      height: 100%;
      justify-content: space-between;
      align-items: stretch;
    `,
    buttonWrap: css`
      margin-left: ${theme.spacing(0.5)};
      padding: ${theme.spacing(0.5)};
      cursor: pointer;
      display: flex;
      align-items: center;
      background: unset;
      &:hover {
        background: ${theme.colors.secondary.border};
      }
    `,
    drawerWrap: css`
      width: 100%;
    `,
    copyButton: css`
      margin-bottom: ${theme.spacing(1.5)};
    `,
  };
};
