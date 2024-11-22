import { Icon, useTheme2 } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {boolean}
   */
  value: boolean;

  /**
   * Bg Color
   *
   * @type {string}
   */
  bgColor?: string;
}

/**
 * Boolean Cell Renderer
 * @param value
 * @param bgColor
 * @constructor
 */
export const BooleanCellRenderer: React.FC<Props> = ({ value, bgColor }) => {
  /**
   * Theme
   */
  const theme = useTheme2();

  return (
    <Icon
      {...TEST_IDS.booleanCellRenderer.root.apply()}
      name={value ? 'check-circle' : 'circle'}
      size="lg"
      style={{
        color: bgColor ? theme.colors.getContrastText(bgColor) : 'inherit',
      }}
    />
  );
};
