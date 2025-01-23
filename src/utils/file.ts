import { saveAs } from 'file-saver';

/**
 * Download CSV
 * @param content
 * @param fileName
 */
export const downloadFile = (content: string, fileName = 'download', isExcel = false) => {
  const fileType = isExcel
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    : 'text/csv;charset=utf-8';

  const name = isExcel ? `${fileName}.xlsx` : `${fileName}.csv`;

  return saveAs(new Blob([content], { type: fileType }), `${name}`);
};
