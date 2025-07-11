import { EventBusSrv, toDataFrame } from '@grafana/data';
import { config } from '@grafana/runtime';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React, { useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { useExportData, useExternalExport, usePagination, useSavedState, useTable } from '@/hooks';
import { ExportFormatType } from '@/types';
import {
  createColumnConfig,
  createExternalExportConfig,
  createPanelOptions,
  createRowHighlightConfig,
  createTableConfig,
  createToolbarOptions,
} from '@/utils';

import { Table } from '../Table';
import { TablePanel } from './TablePanel';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TablePanel>;

/**
 * Mock Table
 */
jest.mock('../Table', () => ({
  Table: jest.fn(() => null),
}));

/**
 * Mock hooks
 */
const emptyArray: any[] = [];

const useTableMock = () => ({
  tableData: emptyArray,
  columns: emptyArray,
  getSubRows: jest.fn(),
});

jest.mock('../../hooks/useTable', () => ({
  useTable: jest.fn(() => useTableMock()),
}));

jest.mock('../../hooks/useSavedState', () => ({
  useSavedState: jest.fn(jest.requireActual('../../hooks/useSavedState').useSavedState),
}));

const onExportMock = jest.fn();
const useExportDataMock = () => ({ table, exportFormat }: { table: any; exportFormat: any }) => onExportMock(table, exportFormat);

jest.mock('../../hooks/useExportData', () => ({
  useExportData: jest.fn(),
}));

const onExternalExportMock = jest.fn();
const useExternalExportMock = () => ({ table }: { table: any }) => onExternalExportMock(table);

jest.mock('../../hooks/useExternalExport', () => ({
  useExternalExport: jest.fn(),
}));

const usePaginationMock = () => {
  const [value, setValue] = useState({ pageIndex: 0, pageSize: 10 });

  return useMemo(
    () => ({
      isEnabled: true,
      isManual: false,
      onChange: setValue,
      value,
      total: 10,
    }),
    [value]
  );
};

jest.mock('../../hooks/usePagination', () => ({
  usePagination: jest.fn(),
}));

/**
 * Panel
 */
describe('TablePanel', () => {
  /**
   * Event Bus
   */
  const eventBus = new EventBusSrv();

  /**
   * Replace Variables
   */
  const replaceVariables = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.panel);
  const selectors = getSelectors(screen);

  const dataFrameA = toDataFrame({
    fields: [
      {
        name: 'field1',
      },
      {
        name: 'field2',
      },
    ],
    refId: 'A',
  });

  /**
   * Panel Data
   */
  const data = {
    series: [dataFrameA],
  };

  /**
   * Panel Options
   */
  const defaultOptions = createPanelOptions();

  const defaultFieldConfig = {
    defaults: {
      noValue: '',
    },
  } as any;

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <TablePanel
        width={400}
        height={400}
        data={data}
        options={defaultOptions}
        eventBus={eventBus}
        fieldConfig={defaultFieldConfig}
        replaceVariables={replaceVariables}
        {...(props as any)}
      />
    );
  };

  beforeEach(() => {
    /**
     * Set default version
     * by default config returns invalid version 1.0 cause error in test
     */
    Object.assign(config, {
      buildInfo: { version: '11.3.0' },
    });
    jest.mocked(useTable).mockImplementation(useTableMock);
    jest.mocked(usePagination).mockImplementation(usePaginationMock);
    // jest.mocked(useLocalStorage).mockImplementation(useLocalStorageMock);
    jest.mocked(useSavedState).mockImplementation(jest.requireActual('../../hooks/useSavedState').useSavedState);
    jest.mocked(useExportData).mockImplementation(useExportDataMock);
    jest.mocked(useExternalExport).mockImplementation(useExternalExportMock);
    replaceVariables.mockImplementation((str: string) => str);
  });

  it('Should find component', async () => {
    await act(async () => render(getComponent({})));
    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should return no data message if series is empty', async () => {
    const emptyData = {
      series: [],
    } as any;

    await act(async () =>
      render(
        getComponent({
          data: emptyData,
        })
      )
    );

    expect(selectors.root(true)).not.toBeInTheDocument();
    expect(selectors.noDataMessage()).toBeInTheDocument();
    expect(selectors.noDataMessage()).toHaveTextContent('No Value. You can change the text using the Standard options');
  });

  it('Should return no data message from standard options if series is empty', async () => {
    const emptyData = {
      series: [],
    } as any;

    const noValueMessage = 'Sorry, no data';

    const fieldConfig = {
      defaults: {
        noValue: noValueMessage,
      },
    } as any;

    await act(async () =>
      render(
        getComponent({
          data: emptyData,
          fieldConfig,
        })
      )
    );

    expect(selectors.root(true)).not.toBeInTheDocument();
    expect(selectors.noDataMessage()).toBeInTheDocument();
    expect(selectors.noDataMessage()).toHaveTextContent(noValueMessage);
  });

  it('Should use first group', async () => {
    const tables = [
      createTableConfig({
        name: 'group1',
        items: [
          createColumnConfig({
            field: { name: 'group1Field', source: '' },
          }),
        ],
      }),
      createTableConfig({
        name: 'group2',
        items: [],
      }),
    ];

    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables,
          }),
        })
      )
    );

    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: [
          expect.objectContaining({
            field: {
              name: 'group1Field',
              source: '',
            },
          }),
        ],
      })
    );
  });

  it('Should switch tables and scroll to selected', async () => {
    const tables = [
      createTableConfig({
        name: 'group1',
        items: [createColumnConfig({ field: { name: 'group1Field', source: '' } })],
      }),
      createTableConfig({
        name: 'group2',
        items: [createColumnConfig({ field: { name: 'group2Field', source: '' } })],
      }),
    ];
    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables,
          }),
        })
      )
    );

    /**
     * Select group2
     */
    await act(async () => fireEvent.click(selectors.tab(false, 'group2')));

    /**
     * Check if group selected
     */
    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: [
          expect.objectContaining({
            field: {
              name: 'group2Field',
              source: '',
            },
          }),
        ],
      })
    );
  });

  it('Should work if no tables', async () => {
    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables: null as never,
          }),
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should allow to download data', async () => {
    const tables = [createTableConfig({})];

    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables,
            toolbar: createToolbarOptions({
              export: true,
              exportFormats: [ExportFormatType.CSV, ExportFormatType.XLSX],
            }),
          }),
        })
      )
    );

    expect(selectors.dropdown()).toBeInTheDocument();

    fireEvent.click(selectors.buttonDownload());

    expect(selectors.buttonSetFormat(true, 'csv')).toBeInTheDocument();
    await act(() => fireEvent.click(selectors.buttonSetFormat(false, 'csv')));

    expect(onExportMock).toHaveBeenCalled();
  });

  it('Should allow to Export data', async () => {
    const tables = [createTableConfig({})];

    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            externalExport: createExternalExportConfig({
              enabled: true,
            }),
            tables,
            toolbar: createToolbarOptions({
              export: true,
              exportFormats: [ExportFormatType.CSV, ExportFormatType.XLSX],
            }),
          }),
        })
      )
    );

    expect(selectors.buttonExport()).toBeInTheDocument();

    fireEvent.click(selectors.buttonExport());

    expect(onExternalExportMock).toHaveBeenCalled();
  });

  it('Should allow to select download format from dropdown', async () => {
    const tables = [createTableConfig({})];

    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables,
            toolbar: createToolbarOptions({
              export: false,
              exportFormats: [ExportFormatType.CSV, ExportFormatType.XLSX],
            }),
          }),
        })
      )
    );

    expect(selectors.dropdown()).toBeInTheDocument();

    expect(selectors.buttonSetFormat(true, 'csv')).not.toBeInTheDocument();
    expect(selectors.buttonSetFormat(true, 'xlsx')).not.toBeInTheDocument();

    /**
     * Open Dropdown menu
     */
    fireEvent.click(selectors.buttonDownload());

    expect(selectors.buttonSetFormat(true, 'csv')).toBeInTheDocument();
    expect(selectors.buttonSetFormat(true, 'xlsx')).toBeInTheDocument();

    /**
     * Select XLSX format
     */
    await act(() => fireEvent.click(selectors.buttonSetFormat(false, 'xlsx')));
    expect(onExportMock).toHaveBeenCalled();

    onExportMock.mockClear();

    /**
     * Open dropdown again and select CSV
     */
    fireEvent.click(selectors.buttonDownload());
    await act(() => fireEvent.click(selectors.buttonSetFormat(false, 'csv')));
    expect(onExportMock).toHaveBeenCalled();
  });

  it('Should directly export when only one format is available', async () => {
    const tables = [createTableConfig({})];

    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables,
            toolbar: createToolbarOptions({
              export: false,
              exportFormats: [ExportFormatType.CSV],
            }),
          }),
        })
      )
    );

    /**
     * Should show direct download button, not dropdown
     */
    expect(selectors.buttonDownload()).toBeInTheDocument();
    expect(selectors.dropdown(true)).not.toBeInTheDocument();

    /**
     * Click download button should directly export
     */
    await act(() => fireEvent.click(selectors.buttonDownload()));
    expect(onExportMock).toHaveBeenCalled();
  });

  it('Should show ScrollContainer since grafana 11.5.0', async () => {
    /**
     * Set version 11.5.0
     * by default config returns invalid version 1.0 cause error in test
     */
    Object.assign(config, {
      buildInfo: { version: '11.5.0' },
    });
    const tables = [
      createTableConfig({
        name: 'group1',
        items: [
          createColumnConfig({
            field: { name: 'group1Field', source: '' },
          }),
        ],
      }),
      createTableConfig({
        name: 'group2',
        items: [],
      }),
    ];

    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables,
          }),
        })
      )
    );

    expect(selectors.defaultScrollContainer(true)).not.toBeInTheDocument();
    expect(selectors.scrollContainer()).toBeInTheDocument();
  });

  it('Should switch tables and apply different highlight options', async () => {
    const tables = [
      createTableConfig({
        name: 'group1',
        items: [createColumnConfig({ field: { name: 'group1Field', source: '' } })],
        rowHighlight: createRowHighlightConfig({}),
      }),
      createTableConfig({
        name: 'group2',
        items: [createColumnConfig({ field: { name: 'group2Field', source: '' } })],
        rowHighlight: createRowHighlightConfig({
          enabled: true,
          smooth: true,
        }),
      }),
    ];
    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables,
          }),
        })
      )
    );

    /**
     * Select group2
     */
    await act(async () => fireEvent.click(selectors.tab(false, 'group2')));

    /**
     * Check if group selected
     */
    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        rowHighlightConfig: expect.objectContaining({
          smooth: true,
          enabled: true,
        }),
      })
    );
  });
  it('Should show open Drawer Button', async () => {
    const tables = [
      createTableConfig({
        name: 'group1',
        items: [
          createColumnConfig({
            field: { name: 'group1Field', source: '' },
          }),
        ],
      }),
    ];

    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables,
            isColumnManagerAvailable: true,
          }),
        })
      )
    );
    expect(selectors.buttonOpenDrawer(false, 'group1')).toBeInTheDocument();
    await act(async () => fireEvent.click(selectors.buttonOpenDrawer(false, 'group1')));

    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: [
          expect.objectContaining({
            field: {
              name: 'group1Field',
              source: '',
            },
          }),
        ],
      })
    );

    expect(Table).toHaveBeenLastCalledWith(expect.objectContaining({ isDrawerOpen: true }), expect.anything());
  });

  it('Should show open Drawer Button for current group', async () => {
    const tables = [
      createTableConfig({
        name: 'group1',
        items: [createColumnConfig({ field: { name: 'group1Field', source: '' } })],
        rowHighlight: createRowHighlightConfig({}),
      }),
      createTableConfig({
        name: 'group2',
        items: [createColumnConfig({ field: { name: 'group2Field', source: '' } })],
        rowHighlight: createRowHighlightConfig({
          enabled: true,
          smooth: true,
        }),
      }),
    ];
    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables,
            isColumnManagerAvailable: true,
          }),
        })
      )
    );

    /**
     * Select group2
     */
    await act(async () => fireEvent.click(selectors.tab(false, 'group2')));

    /**
     * Check if group selected
     */
    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        rowHighlightConfig: expect.objectContaining({
          smooth: true,
          enabled: true,
        }),
      })
    );

    expect(selectors.buttonOpenDrawer(false, 'group2')).toBeInTheDocument();
    await act(async () => fireEvent.click(selectors.buttonOpenDrawer(false, 'group2')));

    expect(Table).toHaveBeenLastCalledWith(expect.objectContaining({ isDrawerOpen: true }), expect.anything());
  });
});
