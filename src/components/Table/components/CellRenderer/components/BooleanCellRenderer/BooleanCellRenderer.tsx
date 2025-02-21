import { Icon, useTheme2 } from '@grafana/ui';
import React, { useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { normalizeBooleanCellValue } from '@/utils';

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
   * Background Color
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

  /**
   * Normalized value
   */
  const normalizedValue = useMemo(() => normalizeBooleanCellValue(value), [value]);

  return (
    <Icon
      {...TEST_IDS.booleanCellRenderer.root.apply()}
      name={normalizedValue ? 'check-circle' : 'circle'}
      size="lg"
      style={{
        color: bgColor ? theme.colors.getContrastText(bgColor) : 'inherit',
      }}
    />
  );
};
