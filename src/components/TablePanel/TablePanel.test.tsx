import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { useSavedState, useTable } from '../../hooks';
import { PanelOptions } from '../../types';
import { TablePanel } from './TablePanel';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TablePanel>;

/**
 * Mock hooks
 */
const useTableMock = () => ({
  tableData: [],
  columns: [],
  getSubRows: jest.fn(),
});

jest.mock('../../hooks/useTable', () => ({
  useTable: jest.fn(() => useTableMock()),
}));

jest.mock('../../hooks/useSavedState', () => ({
  useSavedState: jest.fn(jest.requireActual('../../hooks/useSavedState').useSavedState),
}));

/**
 * Panel
 */
describe('TablePanel', () => {
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
   * Create Options
   */
  const createOptions = (options: Partial<PanelOptions> = {}): PanelOptions => ({
    groups: [],
    ...options,
  });

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TablePanel width={400} height={400} data={data} options={createOptions()} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(useTable).mockImplementation(useTableMock);
    // jest.mocked(useLocalStorage).mockImplementation(useLocalStorageMock);
    jest.mocked(useSavedState).mockImplementation(jest.requireActual('../../hooks/useSavedState').useSavedState);
  });

  it('Should find component', async () => {
    await act(async () => render(getComponent({})));
    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should use first group', async () => {
    await act(async () =>
      render(
        getComponent({
          options: {
            groups: [
              {
                name: 'group1',
                items: [
                  {
                    name: 'group1Field',
                  },
                ],
              },
              {
                name: 'group2',
                items: [],
              },
            ],
          } as any,
        })
      )
    );

    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: [
          {
            name: 'group1Field',
          },
        ],
      })
    );
  });

  it('Should switch groups and scroll to selected', async () => {
    await act(async () =>
      render(
        getComponent({
          options: {
            groups: [
              {
                name: 'group1',
                items: [
                  {
                    name: 'group1Field',
                  },
                ],
              },
              {
                name: 'group2',
                items: [
                  {
                    name: 'group2Field',
                  },
                ],
              },
            ],
          } as any,
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
          {
            name: 'group2Field',
          },
        ],
      })
    );
  });

  it('Should work if no groups', async () => {
    await act(async () =>
      render(
        getComponent({
          options: {
            groups: null,
          } as any,
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
  });
});
