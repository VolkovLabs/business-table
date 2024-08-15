import { css } from '@emotion/css';

/**
 * Get Styles
 */
export const getStyles = () => {
  return {
    filterFacetedList: css`
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 200px;
      overflow: auto;
    `,
  };
};
