import { useStyles2 } from '@grafana/ui';
import React from 'react';

import { getStyles } from './CollapseTitle.styles';

/**
 * Properties
 */
interface Props {
  /**
   * Children
   */
  children: React.ReactNode[] | React.ReactNode | string;
}

/**
 * Collapse Title
 */
export const CollapseTitle: React.FC<Props> = ({ children }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.titleWrapper}>
      <div className={styles.title}>{children}</div>
    </div>
  );
};
