import { ColumnDef } from '@tanstack/react-table';
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';

import { ACTIONS_COLUMN_ID } from '@/constants';

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
   */
  utils.book_append_sheet(wb, ws, tableName ?? 'Sheet1');

  const blob = write(wb, { bookType: 'xlsx', type: 'array' });

  const fileData = new Blob([blob], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  return saveAs(fileData, `${fileName}.xlsx`);
};

/**
 * Convert to XLSX format content
 * @param columns
 * @param data
 */
export const convertToXlsxFormat = <TData>(columns: Array<ColumnDef<TData>>, data: TData[]): unknown[][] => {
  const currentData: unknown[][] = [];
  currentData.push(
    columns.filter((column) => column.id !== ACTIONS_COLUMN_ID).map((column) => column.header || column.id)
  );
  data.forEach((field) => {
    const valuesArray = Object.values(field as object).map((value) => {
      if (value === '' || value === null || value === undefined) {
        return null;
      }
      return value;
    });
    currentData.push(valuesArray);
  });
  return currentData;
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
