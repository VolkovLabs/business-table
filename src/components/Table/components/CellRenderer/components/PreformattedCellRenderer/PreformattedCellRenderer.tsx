import { css, cx } from '@emotion/css';
import { Field } from '@grafana/data';
import { FormattedValueDisplay, useTheme2 } from '@grafana/ui';
import React, { ReactElement } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnConfig } from '@/types';

import { getStyles } from './PreformattedCellRenderer.styles';

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

  /**
   * Background Color
   *
   * @type {string}
   */
  bgColor?: string;
}

/**
 * Default Cell Renderer
 * @param field
 * @param renderValue
 * @constructor
 */
export const PreformattedCellRenderer: React.FC<Props> = ({ field, value, config, bgColor }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  let formattedValue: typeof value | ReactElement = value;

  /**
   * Use displayProcessor
   */
  if (field.display) {
    const displayValue = field.display(value);

    formattedValue = <FormattedValueDisplay value={displayValue} />;
  }

  return (
    <pre
      className={cx(
        config.preformattedStyle ? styles.preformatted : styles.default,
        css`
          background: ${bgColor ? 'inherit' : theme.colors.background.primary};
        `
      )}
    >
      <span
        {...TEST_IDS.preformattedCellRenderer.root.apply()}
        style={{
          color: bgColor ? theme.colors.getContrastText(bgColor) : 'inherit',
          background: bgColor ? 'inherit' : theme.colors.background.primary,
        }}
      >
        {formattedValue}
      </span>
    </pre>
  );
};
