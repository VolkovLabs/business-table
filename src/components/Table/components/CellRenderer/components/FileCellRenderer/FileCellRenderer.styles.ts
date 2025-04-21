import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    errorIcon: css`
      color: ${theme.colors.error.main};
    `,
    pdfPreview: css`
      width: 150px;
      height: 150px;
      style-border: 'none';
    `,
    imagePreview: css`
      width: 150px;
      height: 150px;
      object-fit: 'contain';
    `,
  };
};
