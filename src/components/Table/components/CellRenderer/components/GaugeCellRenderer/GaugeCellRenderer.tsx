import { Field, getFieldConfigWithMinMax, ThresholdsConfig, ThresholdsMode, VizOrientation } from '@grafana/data';
import { BarGauge, Icon, Tooltip, useTheme2 } from '@grafana/ui';
import React, { useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnConfig } from '@/types';

import { getStyles } from './GaugeCellRenderer.styles';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {number}
   */
  value: number;

  /**
   * Bg Color
   *
   * @type {string}
   */
  bgColor?: string;

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
 * Default Scale
 * Keep as original implementation
 */
const defaultScale: ThresholdsConfig = {
  mode: ThresholdsMode.Absolute,
  steps: [
    {
      color: 'blue',
      value: -Infinity,
    },
    {
      color: 'green',
      value: 20,
    },
  ],
};

/**
 * Boolean Cell Renderer
 * @param value
 * @param bgColor
 * @constructor
 */
export const GaugeCellRenderer: React.FC<Props> = ({ value, field, bgColor, config }) => {
  /**
   * Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  const configField = useMemo(() => {
    let currentConfig = getFieldConfigWithMinMax(field, false);
    if (!currentConfig.thresholds) {
      currentConfig = {
        ...currentConfig,
        thresholds: defaultScale,
      };
    }
    return currentConfig;
  }, [field]);

  const displayValue = useMemo(() => {
    /**
     * Use displayProcessor
     */
    if (field.display) {
      return field.display(value);
    }

    /**
     * Can`t work without DisplayProcessor
     */
    return null;
  }, [field, value]);

  return (
    <div {...TEST_IDS.gaugeCellRenderer.root.apply()}>
      {!displayValue ? (
        <Tooltip
          content="Display Processor error. The field does`t have the 'display' property."
          {...TEST_IDS.gaugeCellRenderer.error.apply()}
        >
          <Icon name="exclamation-triangle" size="sm" aria-label="JSON error" className={styles.errorIcon} />
        </Tooltip>
      ) : (
        <BarGauge
          width={config.appearance.width.value}
          height={20}
          field={configField}
          display={field.display}
          text={{ valueSize: config.gauge.valueSize }}
          value={displayValue}
          orientation={VizOrientation.Horizontal}
          theme={theme}
          className={bgColor ? styles.default : ''}
          itemSpacing={1}
          lcdCellWidth={8}
          displayMode={config.gauge.mode}
          valueDisplayMode={config.gauge.valueDisplayMode}
          {...TEST_IDS.gaugeCellRenderer.gauge.apply()}
        />
      )}
    </div>
  );
};
