import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Get Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
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
      gap: ${theme.spacing(1)};
    `,
    itemControls: css`
      display: flex;
      align-items: center;
      background: ${theme.colors.background.secondary};
      flex: 1;
      max-width: 100%;
      min-height: ${theme.spacing(6)};
    `,
    filterDrawer: css`
      flex: 1;
    `,
    itemName: css`
      margin: ${theme.spacing(0, 1)};
    `,
    labelSortable: css`
      cursor: pointer;
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
