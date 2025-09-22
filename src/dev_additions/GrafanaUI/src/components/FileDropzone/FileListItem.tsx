

import { css } from '@emotion/css';
import { formattedValueToString, getValueFormat, GrafanaTheme2 } from '@grafana/data';
import { Button, DropzoneFile, Icon,IconButton, useStyles2 } from '@grafana/ui';
import React from 'react';

// import { useStyles2 } from '../../themes';
// import { trimFileName } from '../../utils/file';
// import { Trans } from '../../utils/i18n';
// import { Button } from '../Button';
// import { Icon } from '../Icon/Icon';
// import { IconButton } from '../IconButton/IconButton';

// import { DropzoneFile } from './FileDropzone';

export function trimFileName(fileName: string): string {
  const nameLength = 16;
  const delimiter = fileName.lastIndexOf('.');
  const extension = fileName.substring(delimiter);
  const file = fileName.substring(0, delimiter);

  if (file.length < nameLength) {
    return fileName;
  }

  return `${file.substring(0, nameLength)}...${extension}`;
}

export const REMOVE_FILE = 'Remove file';
export interface FileListItemProps {
  file: DropzoneFile;
  removeFile?: (file: DropzoneFile) => void;
  showName?: boolean;
  name?: string;
  showSize?: boolean;
  showFileIcon?: boolean;
  fileNameWrapperStyle?: React.CSSProperties;
}

export function FileListItem({ file: customFile, removeFile,fileNameWrapperStyle,showName,showFileIcon,showSize,name }: FileListItemProps) {
  const styles = useStyles2(getStyles);
  const { file, progress, error, abortUpload, retryUpload } = customFile;

  const renderRightSide = () => {
    if (error) {
      return (
        <>
          <span className={styles.error}>{error.message}</span>
          {retryUpload && <IconButton name="sync" tooltip="Retry" tooltipPlacement="top" onClick={retryUpload} />}
          {removeFile && (
            <IconButton
              className={retryUpload ? styles.marginLeft : ''}
              name="trash-alt"
              onClick={() => removeFile(customFile)}
              tooltip={REMOVE_FILE}
            />
          )}
        </>
      );
    }

    if (progress && file.size > progress) {
      return (
        <>
          <progress className={styles.progressBar} max={file.size} value={progress} />
          <span className={styles.paddingLeft}>
            {Math.round((progress / file.size) * 100)}
            {'%'}
          </span>
          {abortUpload && (
            <Button variant="secondary" type="button" fill="text" onClick={abortUpload}>
              <p >Cancel upload</p>
            </Button>
          )}
        </>
      );
    }
    return (
      removeFile && (
        <IconButton
          name="trash-alt"
          onClick={() => removeFile(customFile)}
          tooltip={REMOVE_FILE}
          tooltipPlacement="top"
        />
      )
    );
  };

  const valueFormat = getValueFormat('decbytes')(file.size);
  name ??= trimFileName(file.name)
  return (
    <div className={styles.fileListContainer}>
      <span
      title={file.name}
      className={styles.fileNameWrapper} style={fileNameWrapperStyle}>
        {(showFileIcon ?? true) && <Icon name="file-blank" size="lg" aria-hidden={true} />}
        {(showName ?? true) && <span className={styles.padding}>{name}</span>}
        {(showSize ?? true) && <span>{formattedValueToString(valueFormat)}</span>}
      </span>

      <div className={styles.fileNameWrapper}>{renderRightSide()}</div>
    </div>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    fileListContainer: css({
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(2),
      border: `1px dashed ${theme.colors.border.medium}`,
      backgroundColor: `${theme.colors.background.secondary}`,
      marginTop: theme.spacing(1),
    }),
    fileNameWrapper: css({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }),
    padding: css({
      padding: theme.spacing(0, 1),
    }),
    paddingLeft: css({
      paddingLeft: theme.spacing(2),
    }),
    marginLeft: css({
      marginLeft: theme.spacing(1),
    }),
    error: css({
      paddingRight: theme.spacing(2),
      color: theme.colors.error.text,
    }),
    progressBar: css({
      borderRadius: theme.shape.radius.default,
      height: '4px',
      '::-webkit-progress-bar': {
        backgroundColor: theme.colors.border.weak,
        borderRadius: theme.shape.radius.default,
      },
      '::-webkit-progress-value': {
        backgroundColor: theme.colors.primary.main,
        borderRadius: theme.shape.radius.default,
      },
    }),
  };
}
