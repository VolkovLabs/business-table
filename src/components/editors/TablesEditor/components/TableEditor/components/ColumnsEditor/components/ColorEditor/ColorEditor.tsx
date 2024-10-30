import { ColorPicker, IconButton, useStyles2 } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { EditorProps } from '@/types';

import { getStyles } from './ColorEditor.styles';

/**
 * Properties
 */
interface Props extends EditorProps<string | undefined> {
  /**
   * Test ID
   *
   * @type {string}
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'data-testid'?: string;
}

/**
 * Test Ids
 */
export const testIds = TEST_IDS.colorEditor;

/**
 * Color Editor
 */
export const ColorEditor: React.FC<Props> = ({ onChange, value, ...restProps }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.colorPickerButtons}>
      <ColorPicker
        color={value || 'transparent'}
        onChange={(color) => {
          onChange(color);
        }}
        {...(restProps['data-testid'] ? { 'data-testid': restProps['data-testid'] } : testIds.fieldValue.apply())}
      />
      {value && (
        <IconButton
          name="times"
          size="md"
          variant="secondary"
          tooltip="Clear"
          onClick={() => onChange(undefined)}
          {...testIds.buttonClear.apply()}
        />
      )}
    </div>
  );
};
