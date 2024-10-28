import { ColorPicker, IconButton, InlineField, useStyles2 } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { getStyles } from './ColorEditor.styles';

/**
 * Properties
 */
interface Props {
  /**
   * label
   *
   * @type {string}
   */
  label: string;

  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * value
   *
   * @type {string}
   */
  value?: string;

  /**
   * On Change
   *
   * @param value
   */
  onChange: (value?: string) => void;
}

/**
 * Editable Data Editor
 */
export const ColorEditor: React.FC<Props> = ({ label, onChange, value, name }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  return (
    <InlineField label={label} className={styles.colorPickerContainer} labelWidth={20}>
      <div className={styles.colorPickerButtons}>
        <ColorPicker
          color={value || 'transparent'}
          onChange={(color) => {
            onChange(color);
          }}
          {...TEST_IDS.columnEditor.fieldAppearanceColor.apply(name)}
        />
        {value && (
          <IconButton
            name="times"
            size="md"
            variant="secondary"
            tooltip="Reset to default"
            onClick={() => onChange('')}
            {...TEST_IDS.columnEditor.buttonRemoveColor.apply(name)}
          />
        )}
      </div>
    </InlineField>
  );
};
