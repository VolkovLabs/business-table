import { ColumnDef } from '@tanstack/react-table';
import { saveAs } from 'file-saver';

import { applyAcceptedFiles, convertToXlsxFormat, downloadCsv, downloadXlsx } from './file';

/**
 * file-saver mock
 */
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

/**
 * xlsx mock
 */
jest.mock('xlsx', () => ({
  utils: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    aoa_to_sheet: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    book_new: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(),
}));

/**
 * downloadFile
 */
describe('downloadFile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should create a CSV file with the correct name and content', () => {
    const content = 'id,name\n1,Device1\n2,Device2';
    const fileName = 'devices';

    downloadCsv(content, fileName);

    expect(saveAs).toHaveBeenCalledTimes(1);
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), `${fileName}.csv`);
  });

  it('Should use default file name "download" if no fileName is provided', () => {
    const content = 'id,name\n1,Device1\n2,Device2';

    downloadCsv(content);

    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'download.csv');
  });

  /**
   * downloadXlsx
   */
  describe('downloadXlsx', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Should create a xls file with the correct name and content', () => {
      const content = [
        ['Header1', 'Header2'],
        ['Data1', 'Data2'],
      ];
      const fileName = 'devices';
      downloadXlsx(content, fileName);

      expect(saveAs).toHaveBeenCalledTimes(1);
      expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), `${fileName}.xlsx`);
    });

    it('Should use default file name "download" if no fileName is provided', () => {
      const content = [
        ['Header1', 'Header2'],
        ['Data1', 'Data2'],
      ];

      downloadXlsx(content);

      expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'download.xlsx');
    });
  });

  /**
   * convertToXlsxFormat
   */
  describe('convertToXlsxFormat', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    const columns: Array<ColumnDef<unknown>> = [
      { id: 'id', header: 'ID' },
      /**
       * Use id instead header
       */
      { id: 'Name-id', header: '' },
      { id: 'value', header: 'Value' },
      { id: 'json', header: 'JSON' },
      { id: 'comment.info.name', header: 'Comment' },
    ] as any;

    const data = [
      {
        id: 1,
        name: 'DeviceWithVeryLongTitle',
        value: 10,
        json: '{ "name": "Device1" }',
        'comment.info.name': 'Some comment',
      },
      {
        id: 2,
        name: 'Device 2',
        value: 15,
        json: '{ "name": "Device2" }',
        'comment.info.name': 'Some notes',
      },
      {
        id: 3,
        name: 'Device 3',
        value: 20,
        json: '{ "name": "Device3" }',
        'comment.info.name': '',
      },
    ];

    it('should format data correctly for xlsx', () => {
      const result = convertToXlsxFormat(columns, data);

      /**
       * Check that the result has the correct number of rows
       */
      expect(result.length).toEqual(4);

      /**
       * Check table headers
       */
      expect(result[0]).toEqual(['ID', 'Name-id', 'Value', 'JSON', 'Comment']);

      expect(result[1]).toEqual([1, 'DeviceWithVeryLongTitle', 10, '{ "name": "Device1" }', 'Some comment']);
      expect(result[2]).toEqual([2, 'Device 2', 15, '{ "name": "Device2" }', 'Some notes']);
      expect(result[3]).toEqual([3, 'Device 3', 20, '{ "name": "Device3" }', null]);
    });
  });

  describe('applyAcceptedFiles', () => {
    it('Should return undefined if acceptFiles is empty', () => {
      const result = applyAcceptedFiles('');
      expect(result).toBeUndefined();
    });

    it('Should convert acceptFiles string to an object with file extensions as keys and values as arrays', () => {
      const acceptFiles = '.csv, .png, .txt, .json';
      const result = applyAcceptedFiles(acceptFiles);

      expect(result).toEqual({
        csv: ['.csv'],
        png: ['.png'],
        txt: ['.txt'],
        json: ['.json'],
      });
    });

    it('Should handle leading/trailing spaces in acceptFiles string', () => {
      const acceptFiles = '  .csv, .png ,  .txt ,.json  ';
      const result = applyAcceptedFiles(acceptFiles);

      expect(result).toEqual({
        csv: ['.csv'],
        png: ['.png'],
        txt: ['.txt'],
        json: ['.json'],
      });
    });

    it('Should append trimmedValue to existing array when extension already exists', () => {
      const acceptFiles = '.csv, .png, .csv';
      const result = applyAcceptedFiles(acceptFiles);

      expect(result).toEqual({
        csv: ['.csv', '.csv'],
        png: ['.png'],
      });
    });
  });
});
