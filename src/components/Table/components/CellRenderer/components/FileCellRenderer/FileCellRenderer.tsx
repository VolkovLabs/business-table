import { DataFrame, Field } from '@grafana/data';
import { Button, Icon, Tooltip, useTheme2 } from '@grafana/ui';
import { Row } from '@tanstack/react-table';
import { saveAs } from 'file-saver';
import React, { useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnConfig, SupportedFileType } from '@/types';
import { getFieldBySource, getValueIndex, handleMediaData } from '@/utils';

import { getStyles } from './FileCellRenderer.styles';

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

  /**
   * Row
   *
   * @type {Row<unknown>}
   */
  row: Row<unknown>;

  /**
   * Panel Data
   *
   * @type {DataFrame[]}
   */
  panelData?: DataFrame[];
}

/**
 * File Cell Renderer
 * @param field
 * @param renderValue
 * @constructor
 */
export const FileCellRenderer: React.FC<Props> = ({ value, panelData, config }) => {
  /**
   * Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  const mediaData = handleMediaData(value, config?.fileCell?.displayPreview);

  const fileName = useMemo(() => {
    if (config.fileCell.fileName && panelData) {
      const currentField = getFieldBySource(panelData, config.field);
      const fileNameField = getFieldBySource(panelData, config.fileCell.fileName);

      if (currentField && fileNameField) {
        const currentIndex = getValueIndex(currentField, value);
        const currentFileName = fileNameField.values[currentIndex];
        return currentFileName || 'download';
      }

      return 'download';
    }
    return 'download';
  }, [config.field, config.fileCell.fileName, panelData, value]);

  const renderPreview = useMemo(() => {
    if (!value) {
      return null;
    }

    if (mediaData.type === SupportedFileType.PDF) {
      return (
        <iframe
          src={mediaData.currentMedia}
          className={styles.pdfPreview}
          {...TEST_IDS.fileCellRenderer.previewPdf.apply()}
        />
      );
    }

    if (Object.values(SupportedFileType).includes(mediaData.type as SupportedFileType)) {
      return (
        <img
          src={mediaData.currentMedia}
          alt="preview"
          className={styles.imagePreview}
          {...TEST_IDS.fileCellRenderer.previewImage.apply()}
        />
      );
    }

    return null;
  }, [mediaData.currentMedia, mediaData.type, styles.imagePreview, styles.pdfPreview, value]);

  return (
    <>
      {!value && (
        <Tooltip content="Invalid base64" {...TEST_IDS.fileCellRenderer.error.apply()}>
          <Icon name="exclamation-triangle" size="sm" aria-label="JSON error" className={styles.errorIcon} />
        </Tooltip>
      )}
      {!mediaData.type && (
        <Button
          icon="save"
          size={config?.fileCell?.size ?? 'sm'}
          variant={config?.fileCell?.variant ?? 'primary'}
          disabled={!value}
          onClick={() => {
            saveAs(value, fileName);
          }}
          {...TEST_IDS.fileCellRenderer.buttonSave.apply()}
        >
          {config?.fileCell?.text ?? ''}
        </Button>
      )}
      {mediaData.type && (
        <Tooltip
          content={<>{renderPreview}</>}
          theme="info"
          placement="right"
          interactive
          {...TEST_IDS.fileCellRenderer.previewTooltip.apply()}
        >
          <Button
            icon="save"
            size={config?.fileCell?.size ?? 'sm'}
            variant={config?.fileCell?.variant ?? 'primary'}
            onClick={() => {
              saveAs(value, fileName);
            }}
            {...TEST_IDS.fileCellRenderer.buttonSave.apply()}
            disabled={!value}
          >
            {config?.fileCell?.text ?? ''}
          </Button>
        </Tooltip>
      )}
    </>
  );
};
