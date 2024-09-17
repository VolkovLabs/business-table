import { saveAs } from 'file-saver';

/**
 * Download CSV
 * @param content
 * @param fileName
 */
export const downloadCsv = (content: string, fileName = 'download') =>
  saveAs(new Blob([content], { type: 'text/csv;charset=utf-8' }), `${fileName}.csv`);
