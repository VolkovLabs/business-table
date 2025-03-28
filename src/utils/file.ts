import { DataFrame } from '@grafana/data';
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';

/**
 * Download CSV
 * @param content
 * @param fileName
 */
export const downloadCsv = (content: string, fileName = 'download') => {
  return saveAs(new Blob([content], { type: 'text/csv;charset=utf-8' }), `${fileName}.csv`);
};

/**
 * Download Xlsx
 * @param content
 * @param fileName
 */
export const downloadXlsx = (content: unknown[][], fileName = 'download', tableName?: string) => {
  const ws = utils.aoa_to_sheet(content);
  const wb = utils.book_new();

  /**
   * tableName use for sheet name
   * substring needs here https://support.microsoft.com/en-us/office/rename-a-worksheet-3f1f7148-ee83-404d-8ef0-9ff99fbad1f9
   * Worksheet names cannot: Contain more than 31 characters.
   */
  const sheetName = (tableName ?? 'Sheet1').substring(0, 31);

  utils.book_append_sheet(wb, ws, sheetName);

  const blob = write(wb, { bookType: 'xlsx', type: 'array' });

  const fileData = new Blob([blob], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  return saveAs(fileData, `${fileName}.xlsx`);
};

/**
 * Convert to XLSX format content
 * @param dataFrame
 */
export const convertToXlsxFormat = ({ fields, length }: DataFrame): unknown[][] => {
  if (!fields?.length) {
    return [];
  }

  const rowCount = length ?? Math.max(...fields.map(({ values }) => values.length), 0);

  return [
    fields.map(({ name }) => name),
    ...Array.from({ length: rowCount }, (item, rowIndex) => fields.map(({ values }) => values[rowIndex] ?? null)),
  ];
};

/**
 * Apply Accepted Files
 */
export const applyAcceptedFiles = (acceptFiles?: string) => {
  if (!acceptFiles) {
    return undefined;
  }

  /**
   * acceptFiles Convert to array
   */
  const filesArray = acceptFiles.split(',');

  /**
   * Convert to [key: string]: string[] view according to "Accept" type
   */
  return filesArray.reduce(
    (acc, value) => {
      const trimmedValue = value.trim();
      const extension = trimmedValue.substring(1);

      if (acc.hasOwnProperty(extension)) {
        acc[extension] = [...acc[extension], trimmedValue];
      } else {
        acc[extension] = [trimmedValue];
      }

      return acc;
    },
    {} as Record<string, string[]>
  );
};

/**
 * File to toBase64
 */
export const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
