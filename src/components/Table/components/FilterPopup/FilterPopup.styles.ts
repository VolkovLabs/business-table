import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Get Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    filterPopup: css`
      background-color: ${theme.colors.background.primary};
      padding: ${theme.spacing(1.5)};
      border: 1px solid ${theme.colors.border.weak};
      min-width: 200px;
    `,
    filterPopupLine: css`
      border-top: 1px solid ${theme.colors.border.weak};
      margin: ${theme.spacing(1, 0)};
    `,
    filterPopupFooter: css`
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: ${theme.spacing(0.5)};
    `,
  };
};
