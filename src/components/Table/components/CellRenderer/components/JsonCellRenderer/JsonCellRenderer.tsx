import { css, cx } from '@emotion/css';
import { Drawer, Icon, Tooltip, useTheme2 } from '@grafana/ui';
import { AutosizeCodeEditor } from '@volkovlabs/components';
import React, { useEffect, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnConfig } from '@/types';

import { getStyles } from './JsonCellRenderer.styles';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {string}
   */
  value: string;

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
 * JSON Cell Renderer
 * @param value
 * @param config
 * @param bgColor
 */
export const JsonCellRenderer: React.FC<Props> = ({ value, config, bgColor }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme, config?.showingRows);

  /**
   * State
   */
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [showErrorIcon, setShowErrorIcon] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [text, setText] = useState('');

  const color = bgColor ? theme.colors.getContrastText(bgColor) : theme.colors.secondary.text;

  useEffect(() => {
    const formatJson = () => {
      setShowErrorIcon(false);

      try {
        setText(JSON.stringify(JSON.parse(value), null, 2));
      } catch (e) {
        setShowErrorIcon(true);

        let message = '';
        if (e instanceof Error && e.message) {
          message = e.message;
        }

        setErrorMessage(
          `Failed to format JSON in cell correctly (this will cause JSON to not print nicely): ${message}`
        );
        setText(value);
      }
    };

    formatJson();
  }, [value]);

  return (
    <>
      <div className={styles.cellWrap}>
        {showErrorIcon && (
          <Tooltip content={errorMessage} {...TEST_IDS.jsonCellRenderer.error.apply()}>
            <Icon
              name="exclamation-triangle"
              size="sm"
              aria-label="JSON error"
              className={styles.errorIcon}
              {...TEST_IDS.jsonCellRenderer.errorIcon.apply()}
            />
          </Tooltip>
        )}
        <div className={styles.cellContent}>
          <pre
            {...TEST_IDS.jsonCellRenderer.formattedText.apply()}
            className={cx(
              styles.preformatted,
              css`
                color: ${color};
              `
            )}
          >
            {text}
          </pre>
          <div
            className={styles.buttonWrap}
            onClick={() => setDrawerOpen(true)}
            {...TEST_IDS.jsonCellRenderer.buttonOpenDrawer.apply()}
          >
            <Icon
              name="eye"
              aria-label="Open inspector"
              style={{ color: bgColor ? color : theme.colors.primary.text }}
            />
          </div>
        </div>
      </div>
      {isDrawerOpen && (
        <Drawer title="Inspect value" onClose={() => setDrawerOpen(false)}>
          <div className={styles.drawerWrap}>
            <AutosizeCodeEditor
              showMiniMap={true}
              value={text}
              language="json"
              isEscaping={true}
              readOnly={true}
              {...TEST_IDS.jsonCellRenderer.codeEditor.apply()}
            />
          </div>
        </Drawer>
      )}
    </>
  );
};
