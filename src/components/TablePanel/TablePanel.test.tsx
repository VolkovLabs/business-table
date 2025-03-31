import { EventBusSrv } from '@grafana/data';
import { config } from '@grafana/runtime';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React, { useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { useExportData, usePagination, useSavedState, useTable } from '@/hooks';
import { ExportFormatType } from '@/types';
import {
  createColumnConfig,
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
const useExportDataMock = () => onExportMock;

jest.mock('../../hooks/useExportData', () => ({
  useExportData: jest.fn(),
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
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.panel);
  const selectors = getSelectors(screen);

  /**
   * Panel Data
   */
  const data = {
    series: [],
  };

  /**
   * Panel Options
   */
  const defaultOptions = createPanelOptions();

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
  });

  it('Should find component', async () => {
    await act(async () => render(getComponent({})));
    expect(selectors.root()).toBeInTheDocument();
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

    expect(selectors.buttonDownload()).toBeInTheDocument();

    fireEvent.click(selectors.buttonDownload());

    expect(onExportMock).toHaveBeenCalled();
  });

  it('Should allow to change download format data', async () => {
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
    expect(selectors.buttonFormat()).toBeInTheDocument();
    expect(selectors.buttonFormat()).toHaveTextContent('csv');

    expect(selectors.buttonSetFormat(true, 'csv')).not.toBeInTheDocument();
    expect(selectors.buttonSetFormat(true, 'xlsx')).not.toBeInTheDocument();

    /**
     * Open Dropdown menu
     */
    fireEvent.click(selectors.dropdown());

    expect(selectors.buttonSetFormat(true, 'csv')).toBeInTheDocument();
    expect(selectors.buttonSetFormat(true, 'xlsx')).toBeInTheDocument();

    /**
     * Change format
     */
    await act(() => fireEvent.click(selectors.buttonSetFormat(false, 'xlsx')));
    expect(selectors.buttonFormat()).toHaveTextContent('xlsx');

    /**
     * Change format
     */
    fireEvent.click(selectors.dropdown());
    await act(() => fireEvent.click(selectors.buttonSetFormat(false, 'csv')));
    expect(selectors.buttonFormat()).toHaveTextContent('csv');
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
