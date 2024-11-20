import { InlineSwitch } from '@grafana/ui';
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
}

/**
 * Boolean Cell Renderer
 * @param value
 * @constructor
 */
export const BooleanCellRenderer: React.FC<Props> = ({ value }) => {
  return <InlineSwitch disabled value={value} transparent={true} {...TEST_IDS.booleanCellRenderer.root.apply()} />;
};
