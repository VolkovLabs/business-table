import { saveAs } from 'file-saver';

import { downloadFile } from './file';

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

    downloadFile(content, fileName);

    expect(saveAs).toHaveBeenCalledTimes(1);
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), `${fileName}.csv`);
  });

  it('Should use default file name "download" if no fileName is provided', () => {
    const content = 'id,name\n1,Device1\n2,Device2';

    downloadFile(content);

    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'download.csv');
  });

  it('Should create a xlsx file with the correct name and content', () => {
    const content = 'id,name\n1,Device1\n2,Device2';
    const fileName = 'devices';

    downloadFile(content, fileName, true);

    expect(saveAs).toHaveBeenCalledTimes(1);
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), `${fileName}.xlsx`);
  });
});
