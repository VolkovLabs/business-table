import { cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { useTable } from '../../hooks';
import { PanelOptions } from '../../types';
import { Table } from '../Table';
import { getStyles } from './TablePanel.styles';

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
  const styles = useStyles2(getStyles);

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
      className={cx(styles.root)}
      style={{
        width,
        height,
      }}
    >
      <Table data={tableData} columns={columns} height={height} />
    </div>
  );
};
