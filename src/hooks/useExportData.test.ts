import { Field, FieldType, toCSV, toDataFrame } from '@grafana/data';
import { ColumnDef, createTable, getCoreRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { renderHook } from '@testing-library/react';

import { ACTIONS_COLUMN_ID } from '@/constants';
import { ExportFormatType } from '@/types';
import {
  createColumnAccessorFn,
  createColumnMeta,
  createTableConfig,
  dataFrameToObjectArray,
  downloadFile,
} from '@/utils';

import { useExportData } from './useExportData';

/**
 * Mock file utils
 */
jest.mock('../utils/file', () => ({
  downloadFile: jest.fn(),
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

    expect(downloadFile).not.toHaveBeenCalled();
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
    expect(downloadFile).toHaveBeenCalledWith(
      toCSV([
        toDataFrame({
          fields: [nameField, valueField],
        }),
      ]),
      expect.any(String),
      false
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

    expect(downloadFile).toHaveBeenCalledWith(
      toCSV([
        toDataFrame({
          fields: [nameField, valueField],
        }),
      ]),
      expect.any(String),
      false
    );
  });
});
