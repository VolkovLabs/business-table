import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    colorPickerContainer: css`
      align-items: center;
    `,
    colorPickerButtons: css`
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: ${theme.spacing(1)};
      padding: ${theme.spacing(0, 1)};
      min-height: ${theme.spacing(4)};
    `,
  };
};
