import { EventBusSrv } from '@grafana/data';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React, { useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { useExportData, usePagination, useSavedState, useTable } from '@/hooks';
import { createColumnConfig, createPanelOptions, createTableConfig, createToolbarOptions } from '@/utils';

import { TablePanel } from './TablePanel';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TablePanel>;

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

  it('Should filter hidden columns', async () => {
    await act(async () =>
      render(
        getComponent({
          options: createPanelOptions({
            tables: [
              createTableConfig({
                name: 'group1',
                items: [
                  createColumnConfig({ field: { name: 'group1Field1', source: '' }, enabled: true }),
                  createColumnConfig({ field: { name: 'group1Field2', source: '' }, enabled: false }),
                ],
              }),
            ],
          }),
        })
      )
    );

    /**
     * Check if hidden columns filtered
     */
    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: [
          expect.objectContaining({
            field: {
              name: 'group1Field1',
              source: '',
            },
            enabled: true,
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
            }),
          }),
        })
      )
    );

    expect(selectors.buttonDownload()).toBeInTheDocument();

    fireEvent.click(selectors.buttonDownload());

    expect(onExportMock).toHaveBeenCalled();
  });
});
