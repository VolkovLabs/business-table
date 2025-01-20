import { Field, FieldType, toCSV, toDataFrame } from '@grafana/data';
import { ColumnDef, createTable, getCoreRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { renderHook } from '@testing-library/react';

import { ACTIONS_COLUMN_ID } from '@/constants';
import { ExportFormatType } from '@/types';
import {
  convertToXlsxFormat,
  createColumnAccessorFn,
  createColumnMeta,
  createTableConfig,
  dataFrameToObjectArray,
  downloadCsv,
  downloadXlsx,
} from '@/utils';

import { useExportData } from './useExportData';

/**
 * Mock file utils
 */
jest.mock('../utils/file', () => ({
  downloadCsv: jest.fn(),
  convertToXlsxFormat: jest.fn(),
  downloadXlsx: jest.fn(),
}));

describe('useExportData', () => {
  /**
   * Replace Variables
   */
  const replaceVariables = jest.fn();

  /**
   * Frame
   */
  const nameField: Field = {
    name: 'name',
    config: {
      displayName: 'Name',
    },
    type: FieldType.string,
    values: ['device1', 'device2'],
  };
  const valueField = {
    name: 'value',
    config: {
      unit: 'm2',
    },
    type: FieldType.number,
    values: [10, 20],
  };
  const frame = toDataFrame({
    fields: [nameField, valueField],
  });

  /**
   * Data
   */
  const data = dataFrameToObjectArray(frame);

  it('Should not download if no table', () => {
    const { result } = renderHook(() =>
      useExportData({
        data,
        columns: [],
        panelTitle: 'Tables',
        tableConfig: createTableConfig({
          name: 'hello',
        }),
        exportFormat: ExportFormatType.CSV,
        replaceVariables,
      })
    );

    result.current({ table: null });

    expect(downloadCsv).not.toHaveBeenCalled();
    expect(replaceVariables).not.toHaveBeenCalled();
  });

  it('Should download data as csv', () => {
    const columns: Array<ColumnDef<unknown>> = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          field: nameField,
        }),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          field: valueField,
        }),
      },
    ];

    const { result } = renderHook(() =>
      useExportData({
        data,
        columns,
        panelTitle: 'Tables',
        tableConfig: createTableConfig({
          name: 'hello',
        }),
        exportFormat: ExportFormatType.CSV,
        replaceVariables,
      })
    );

    const table = createTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      enableFilters: true,
      enableSorting: true,
      onStateChange: () => null,
      renderFallbackValue: () => null,
      state: {
        columnPinning: {
          left: [],
          right: [],
        },
        columnFilters: [],
        sorting: [],
      },
    });

    result.current({ table });

    expect(replaceVariables).toHaveBeenCalled();
    expect(downloadCsv).toHaveBeenCalledWith(
      toCSV([
        toDataFrame({
          fields: [nameField, valueField],
        }),
      ]),
      expect.any(String)
    );
  });

  it('Should filter actions column', () => {
    const columns: Array<ColumnDef<unknown>> = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          field: nameField,
        }),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          field: valueField,
        }),
      },
      {
        id: ACTIONS_COLUMN_ID,
        accessorFn: createColumnAccessorFn(''),
      },
    ];

    const { result } = renderHook(() =>
      useExportData({
        data,
        columns,
        panelTitle: 'Tables',
        tableConfig: createTableConfig({
          name: 'hello',
        }),
        exportFormat: ExportFormatType.CSV,
        replaceVariables,
      })
    );

    const table = createTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      enableFilters: true,
      enableSorting: true,
      onStateChange: () => null,
      renderFallbackValue: () => null,
      state: {
        columnPinning: {
          left: [],
          right: [],
        },
        columnFilters: [],
        sorting: [],
      },
    });

    result.current({ table });

    expect(downloadCsv).toHaveBeenCalledWith(
      toCSV([
        toDataFrame({
          fields: [nameField, valueField],
        }),
      ]),
      expect.any(String)
    );
  });

  it('Should download data as xlsx', () => {
    const mockedXlsxContent = [
      ['name', 'value'],
      ['device1', 10],
      ['device2', 20],
    ];
    jest.mocked(convertToXlsxFormat).mockReturnValueOnce(mockedXlsxContent);
    const columns: Array<ColumnDef<unknown>> = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          field: nameField,
        }),
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          field: valueField,
        }),
      },
    ];

    const { result } = renderHook(() =>
      useExportData({
        data,
        columns,
        panelTitle: 'Tables',
        tableConfig: createTableConfig({
          name: 'hello',
        }),
        exportFormat: ExportFormatType.XLSX,
        replaceVariables,
      })
    );

    const table = createTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      enableFilters: true,
      enableSorting: true,
      onStateChange: () => null,
      renderFallbackValue: () => null,
      state: {
        columnPinning: {
          left: [],
          right: [],
        },
        columnFilters: [],
        sorting: [],
      },
    });

    result.current({ table });

    expect(replaceVariables).toHaveBeenCalled();
    expect(downloadXlsx).toHaveBeenCalledWith(mockedXlsxContent, expect.any(String));
  });
});
