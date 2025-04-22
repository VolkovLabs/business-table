import { saveAs } from 'file-saver';

import { SupportedFileType } from '@/types';

import { applyAcceptedFiles, convertToXlsxFormat, downloadCsv, downloadXlsx, handleMediaData } from './file';

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
    it('Should return empty array if fields are empty', () => {
      expect(convertToXlsxFormat({ fields: [], length: 0 })).toEqual([]);
    });

    it('Should correctly convert fields to xlsx format', () => {
      const dataFrame = {
        fields: [
          { name: 'ID', values: [1, 2, 3] },
          { name: 'Name', values: ['Alice', 'Bob', 'Charlie'] },
          { name: 'Age', values: [25, 30, null] },
        ],
        length: 3,
      } as any;

      expect(convertToXlsxFormat(dataFrame)).toEqual([
        ['ID', 'Name', 'Age'],
        [1, 'Alice', 25],
        [2, 'Bob', 30],
        [3, 'Charlie', null],
      ]);
    });

    it('Should handle missing length by calculating max values length', () => {
      const dataFrame = {
        fields: [
          { name: 'A', values: [1, 2] },
          { name: 'B', values: ['x', 'y', 'z'] },
        ],
      } as any;

      expect(convertToXlsxFormat(dataFrame)).toEqual([
        ['A', 'B'],
        [1, 'x'],
        [2, 'y'],
        [null, 'z'],
      ]);
    });

    it('Should preserve empty strings and null values', () => {
      const dataFrame = {
        fields: [
          { name: 'Col1', values: ['', null, 'Test'] },
          { name: 'Col2', values: [null, '', ''] },
        ],
      } as any;

      expect(convertToXlsxFormat(dataFrame)).toEqual([
        ['Col1', 'Col2'],
        ['', null],
        [null, ''],
        ['Test', ''],
      ]);
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

  describe('handleMediaData', () => {
    it('Should return original media and empty type if mediaField is falsy', () => {
      expect(handleMediaData('', true)).toEqual({ currentMedia: '', type: '' });
      expect(handleMediaData(undefined as any, true)).toEqual({ currentMedia: undefined, type: '' });
    });

    it('Should return original media and empty type if displayPreview is false', () => {
      expect(handleMediaData('someBase64String', false)).toEqual({
        currentMedia: 'someBase64String',
        type: '',
      });
    });

    it('Should detect type from header if media has base64 header', () => {
      const media = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`;

      const result = handleMediaData(media, true);
      expect(result.type).toEqual(SupportedFileType.IMAGE);
      expect(result.currentMedia).toEqual(media);
    });

    it('Should add header if media has no base64 prefix and matches symbol map', () => {
      /**
       * Starts with "i" -> PNG
       */
      const media = 'iVBORw0KGgoAAAANSUhEUgAA...';

      const result = handleMediaData(media, true);
      expect(result.type).toEqual(SupportedFileType.PNG);
      expect(result.currentMedia).toEqual(`data:image/png;base64,${media}`);
    });

    it('Should fallback to generic base64 if no match found in symbol map', () => {
      /**
       * Starts with x -> no medai types
       */
      const media = 'xABCDEF...';

      const result = handleMediaData(media, true);
      expect(result.type).toEqual(undefined);
      expect(result.currentMedia).toEqual(`data:;base64,${media}`);
    });

    it('Should detect PDF from header', () => {
      const media = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp...';

      const result = handleMediaData(media, true);
      expect(result.type).toEqual(SupportedFileType.PDF);
      expect(result.currentMedia).toEqual(media);
    });
  });
});
