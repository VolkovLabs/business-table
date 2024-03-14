import { css, cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { useStyles } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { useTable } from '../../hooks';
import { getStyles } from '../../styles';
import { PanelOptions } from '../../types';
import { Table } from '../Table';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const TablePanel: React.FC<Props> = ({ data, width, height, options }) => {
  /**
   * Styles
   */
  const styles = useStyles(getStyles);

  /**
   * Table
   */
  const { tableData, columns } = useTable({ data, options });

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
      <Table data={tableData} columns={columns} />
    </div>
  );
};
