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
    item: css`
      margin-bottom: ${theme.spacing(1)};
    `,
    dragHandle: css`
      display: flex;
      margin: ${theme.spacing(0, 0.5)};
    `,
    dragIcon: css`
      cursor: grab;
      color: ${theme.colors.text.disabled};
      &:hover {
        color: ${theme.colors.text};
      }
    `,
    drawerColumnItem: css`
      display: flex;
      background: ${theme.colors.background.secondary};
      padding: ${theme.spacing(1)};
    `,
    toolbar: css`
      padding: ${theme.spacing(0.5)};
    `,
    header: css`
      position: sticky;
      top: 0;
      background-color: ${theme.colors.background.primary};
      z-index: 120;
      min-width: 100%;
      left: 0;
    `,
    tabs: css`
      div > div {
        flex-direction: column;
        max-width: 100%;
      }
      padding: 0;
      border-bottom: 1px solid ${theme.colors.border.weak};
      background-color: transparent;
      min-height: 33px;
    `,
    tabButton: css`
      overflow: hidden;
      max-width: 100%;

      > div {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
    downloadButtons: css`
      flex-direction: row !important;
    `,
    menuItem: css`
      background: ${theme.colors.background.primary};
      &:hover {
        z-index: ${theme.zIndex.dropdown};
        background: ${theme.colors.background.secondary};
      }
    `,
    drawerButton: css`
      margin-left: ${theme.spacing(1)};
      align-self: center;
      padding: ${theme.spacing(0.5)};

      &:hover {
        cursor: pointer;
        background: ${theme.colors.background.secondary};
      }
    `,
    customIcon: css`
      width: 1em;
      height: 1em;
      margin-left: ${theme.spacing(1)};
      vertical-align: middle;
      cursor: pointer;
    `,
    noDataMessage: css`
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${theme.spacing(2)};
      color: ${theme.colors.border.strong};
    `,
  };
};
