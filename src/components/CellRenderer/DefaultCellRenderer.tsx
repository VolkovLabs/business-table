import { Field } from '@grafana/data';
import { FormattedValueDisplay } from '@grafana/ui';
import React, { ReactElement } from 'react';

import { TEST_IDS } from '@/constants';
import { CellType, ColumnConfig } from '@/types';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {string | number}
   */
  value: string | number;

  /**
   * Field
   *
   * @type {Field}
   */
  field: Field;

  /**
   * Config
   *
   * @type {ColumnConfig}
   */
  config: ColumnConfig;
}

/**
 * Default Cell Renderer
 * @param field
 * @param renderValue
 * @constructor
 */
export const DefaultCellRenderer: React.FC<Props> = ({ field, value, config }) => {
  let formattedValue: typeof value | ReactElement = value;
  let color = 'inherit';

  /**
   * Use displayProcessor
   */
  if (field.display) {
    const displayValue = field.display(value);

    if (displayValue.color) {
      color = displayValue.color;
    }

    formattedValue = <FormattedValueDisplay value={displayValue} />;
  }

  return (
    <span
      {...TEST_IDS.defaultCellRenderer.root.apply()}
      style={{
        color: config.type === CellType.COLORED_TEXT ? color : 'inherit',
      }}
    >
      {formattedValue}
    </span>
  );
};
