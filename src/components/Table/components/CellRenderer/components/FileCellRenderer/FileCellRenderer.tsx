import { Field } from '@grafana/data';
import { Button } from '@grafana/ui';
import { saveAs } from 'file-saver';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnConfig } from '@/types';

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
 * File Cell Renderer
 * @param field
 * @param renderValue
 * @constructor
 */
export const FileCellRenderer: React.FC<Props> = ({ value, config }) => {
  return (
    <Button
      icon="save"
      size={config?.fileCell?.size ?? 'sm'}
      variant={config?.fileCell?.variant ?? 'primary'}
      onClick={() => {
        saveAs(value);
      }}
      {...TEST_IDS.fileCellRenderer.buttonSave.apply()}
    >
      {config?.fileCell?.text ?? ''}
    </Button>
  );
};
