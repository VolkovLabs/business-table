import { Field, FieldType, LoadingState, toDataFrame } from '@grafana/data';
import { ColumnDef, createTable, getCoreRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { renderHook } from '@testing-library/react';
import { useDatasourceRequest } from '@volkovlabs/components';

import {
  convertTableToDataFrame,
  convertToXlsxFormat,
  createColumnAccessorFn,
  createColumnMeta,
  createExternalExportConfig,
  dataFrameToObjectArray,
} from '@/utils';

import { useExternalExport } from './useExternalExport';

jest.mock('@/utils', () => ({
  ...jest.requireActual('@/utils'),
  convertToXlsxFormat: jest.fn(),
  format: jest.fn().mockReturnValue('formatted-value'),
}));

/**
 * get mocked function
 * I don`t find another better approach for this case to handle it and call correctly with params
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const formatMock = require('@/utils').format;

describe('useExternalExport', () => {
  /**
   * Mocks
   */
  const replaceVariables = jest.fn();
  const datasourceRequest = jest.fn();
  const setError = jest.fn();

  /**
   * Frame
   */
  const nameField: Field = {
    name: 'name',
    config: {
      displayName: 'name',
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

  beforeEach(() => {
    jest.mocked(useDatasourceRequest).mockReturnValue(datasourceRequest);
  });

  it('Should not export data if no table', async () => {
    const { result } = renderHook(() =>
      useExternalExport({
        data: data,
        columns: [],
        replaceVariables,
        setError,
        externalExport: createExternalExportConfig({
          enabled: true,
        }),
      })
    );

    await result.current({ table: null });

    expect(datasourceRequest).not.toHaveBeenCalled();
  });

  it('Should not export data if no request', async () => {
    const columns: Array<ColumnDef<unknown>> = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          field: nameField,
        }),
        header: 'name',
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          field: valueField,
        }),
        header: 'value',
      },
    ];

    const { result } = renderHook(() =>
      useExternalExport({
        data: data,
        columns: columns,
        replaceVariables,
        setError,
        externalExport: createExternalExportConfig({
          enabled: true,
          request: undefined,
        }),
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

    expect(datasourceRequest).not.toHaveBeenCalled();
  });

  it('Should not export data if no payload', async () => {
    const columns: Array<ColumnDef<unknown>> = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          field: nameField,
        }),
        header: 'name',
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          field: valueField,
        }),
        header: 'value',
      },
    ];

    const { result } = renderHook(() =>
      useExternalExport({
        data: data,
        columns: columns,
        replaceVariables,
        setError,
        externalExport: createExternalExportConfig({
          enabled: true,
          request: {
            payload: undefined,
            datasource: 'ds',
          } as any,
        }),
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

    expect(datasourceRequest).not.toHaveBeenCalled();
  });

  it('Should not export data if no datasource', async () => {
    const columns: Array<ColumnDef<unknown>> = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          field: nameField,
        }),
        header: 'name',
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          field: valueField,
        }),
        header: 'value',
      },
    ];

    const { result } = renderHook(() =>
      useExternalExport({
        data: data,
        columns: columns,
        replaceVariables,
        setError,
        externalExport: createExternalExportConfig({
          enabled: true,
          request: {
            payload: {},
            datasource: '',
          } as any,
        }),
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

    expect(datasourceRequest).not.toHaveBeenCalled();
  });

  it('Should run export', async () => {
    datasourceRequest.mockResolvedValue({
      state: LoadingState.Done,
    });

    const columns: Array<ColumnDef<unknown>> = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          field: nameField,
        }),
        header: 'name',
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          field: valueField,
        }),
        header: 'value',
      },
    ];

    const { result } = renderHook(() =>
      useExternalExport({
        data: data,
        columns: columns,
        replaceVariables,
        setError,
        externalExport: createExternalExportConfig({
          enabled: true,
          request: {
            payload: { name: 'hello' },
            datasource: 'postgres',
          } as any,
        }),
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

    expect(datasourceRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { name: 'hello' },
        datasource: 'postgres',
        replaceVariables: expect.any(Function),
      })
    );
  });

  it('Should handle datasource error', async () => {
    const errorMessage = 'Something went wrong';

    datasourceRequest.mockResolvedValue({
      state: LoadingState.Error,
      errors: [errorMessage],
    });

    const columns: Array<ColumnDef<unknown>> = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({
          field: nameField,
        }),
        header: 'name',
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({
          field: valueField,
        }),
        header: 'value',
      },
    ];

    const { result } = renderHook(() =>
      useExternalExport({
        data: data,
        columns,
        replaceVariables,
        setError,
        externalExport: createExternalExportConfig({
          enabled: true,
          request: {
            payload: { name: 'error' },
            datasource: 'postgres',
          } as any,
        }),
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

    await expect(result.current({ table })).rejects.toEqual([errorMessage]);

    expect(setError).toHaveBeenCalledWith(expect.stringContaining('Something went wrong'));
  });

  it('Should handle Error instance with message', async () => {
    datasourceRequest.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useExternalExport({
        data,
        columns: [],
        replaceVariables,
        setError,
        externalExport: createExternalExportConfig({
          enabled: true,
          request: {
            payload: { foo: 'bar' },
            datasource: 'ds',
          } as any,
        }),
      })
    );

    const table = createTable({
      data,
      columns: [],
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      state: { columnPinning: { left: [], right: [] }, columnFilters: [], sorting: [] },
      onStateChange: () => null,
      renderFallbackValue: () => null,
    });

    await expect(result.current({ table })).rejects.toThrow('Network error');

    expect(setError).toHaveBeenCalledWith('Error: Network error');
  });

  it('Should handle array error', async () => {
    datasourceRequest.mockRejectedValue(['First error', 'Second error']);

    const { result } = renderHook(() =>
      useExternalExport({
        data,
        columns: [],
        replaceVariables,
        setError,
        externalExport: createExternalExportConfig({
          enabled: true,
          request: {
            payload: { foo: 'bar' },
            datasource: 'ds',
          } as any,
        }),
      })
    );

    const table = createTable({
      data,
      columns: [],
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      state: { columnPinning: { left: [], right: [] }, columnFilters: [], sorting: [] },
      onStateChange: () => null,
      renderFallbackValue: () => null,
    });

    await expect(result.current({ table })).rejects.toEqual(['First error', 'Second error']);

    expect(setError).toHaveBeenCalledWith('Error: First error');
  });

  it('Should handle unknown error shape', async () => {
    const customError = { code: 500, text: 'Internal Server Error' };
    datasourceRequest.mockRejectedValue(customError);

    const { result } = renderHook(() =>
      useExternalExport({
        data,
        columns: [],
        replaceVariables,
        setError,
        externalExport: createExternalExportConfig({
          enabled: true,
          request: {
            payload: { foo: 'bar' },
            datasource: 'ds',
          } as any,
        }),
      })
    );

    const table = createTable({
      data,
      columns: [],
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      state: { columnPinning: { left: [], right: [] }, columnFilters: [], sorting: [] },
      onStateChange: () => null,
      renderFallbackValue: () => null,
    });

    await expect(result.current({ table })).rejects.toEqual(customError);

    expect(setError).toHaveBeenCalledWith('Error: {"code":500,"text":"Internal Server Error"}');
  });

  it('Should call replaceVariables with correct arguments', async () => {
    /**
     * mock datasourceRequest
     */
    datasourceRequest.mockImplementation(async ({ replaceVariables: replaceVars }) => {
      const value = 'some-template-string';
      const scopedVars = { someVar: { value: 'someValue' } };

      /**
       * Call replaceVars manually
       */
      await replaceVars(value, scopedVars);
      return { state: LoadingState.Done };
    });

    /**
     * Mock columns
     */
    const columns: Array<ColumnDef<unknown>> = [
      {
        id: 'name',
        accessorFn: createColumnAccessorFn('name'),
        meta: createColumnMeta({ field: nameField }),
        header: 'name',
      },
      {
        id: 'value',
        accessorFn: createColumnAccessorFn('value'),
        meta: createColumnMeta({ field: valueField }),
        header: 'value',
      },
    ];

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
        columnPinning: { left: [], right: [] },
        columnFilters: [],
        sorting: [],
      },
    });

    /**
     * Mock columns
     */
    const { result } = renderHook(() =>
      useExternalExport({
        data,
        columns,
        replaceVariables,
        setError,
        externalExport: createExternalExportConfig({
          enabled: true,
          request: {
            payload: { name: 'hello' },
            datasource: 'postgres',
          } as any,
        }),
      })
    );

    await result.current({ table });

    expect(replaceVariables).toHaveBeenCalledWith(
      'some-template-string',
      { someVar: { value: 'someValue' } },
      expect.any(Function)
    );

    const callback = replaceVariables.mock.calls[0][2];
    const original = 'original-value';
    const variable = { name: 'testVar' };
    callback(original, variable);

    /**
     * Check formatMock
     * last value is undefined as we are not passing any data to mock
     */
    expect(formatMock).toHaveBeenCalledWith(original, variable, undefined);
  });
});
