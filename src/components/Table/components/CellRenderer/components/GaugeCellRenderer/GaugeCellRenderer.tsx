import { Field, getFieldConfigWithMinMax, ThresholdsConfig, ThresholdsMode, VizOrientation } from '@grafana/data';
import { BarGauge, Icon, Tooltip, useTheme2 } from '@grafana/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';

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
 * Gauge Cell Renderer
 * @param value
 * @param bgColor
 * @param field
 * @param config
 * @constructor
 */
export const GaugeCellRenderer: React.FC<Props> = ({ value, field, bgColor, config }) => {
  /**
   * Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * elementRef use for 'auto' width
   */
  const elementRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(config.appearance.width.value);

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

  useEffect(() => {
    if (config.appearance.width.auto) {
      if (elementRef.current) {
        setWidth(elementRef.current.offsetWidth);
      }
    }
    if (!config.appearance.width.auto) {
      setWidth(config.appearance.width.value);
    }
  }, [config.appearance.width]);

  return (
    <div {...TEST_IDS.gaugeCellRenderer.root.apply()} ref={elementRef} className={styles.root}>
      {!displayValue ? (
        <Tooltip
          content="Display Processor error. The field does`t have the 'display' property."
          {...TEST_IDS.gaugeCellRenderer.error.apply()}
        >
          <Icon name="exclamation-triangle" size="sm" aria-label="JSON error" className={styles.errorIcon} />
        </Tooltip>
      ) : (
        <BarGauge
          width={width}
          height={22}
          field={configField}
          display={field.display}
          text={{ valueSize: config.gauge.valueSize }}
          value={displayValue}
          orientation={VizOrientation.Horizontal}
          theme={theme}
          className={bgColor ? styles.border : ''}
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
