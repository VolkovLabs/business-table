import { css, cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { getStyles } from '../../styles';
import { PanelOptions } from '../../types';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const TablePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const styles = getStyles();

  /**
   * Get Field
   */
  const field = data.series
    .map((series) => series.fields.find((field) => field.name === options.name))
    .map((field) => field?.values.get(field.values.length - 1))
    .toString();

  /**
   * Return
   */
  return (
    <div
      data-testid={TEST_IDS.panel.root}
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      {field}
    </div>
  );
};
