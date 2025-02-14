import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Get Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    expandButton: css`
      margin-right: ${theme.spacing(1)};
    `,
    link: css`
      position: relative;
      text-decoration: none;
      transition: color 0.3s ease;
      color: ${theme.colors.text.link};

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        background-color: ${theme.colors.text.link};
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      &:hover {
        color: ${theme.colors.text.link};

        &::after {
          transform: scaleX(1);
        }
      }
    `,
    subRowsTotal: css`
      margin-left: ${theme.spacing(1)};
      font-size: ${theme.spacing(1.25)};
      color: ${theme.colors.text.disabled};
    `,
  };
};
