import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ColumnDef, ColumnPinningState, ExpandedState, GroupingState } from '@tanstack/react-table';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue, ColumnPinDirection } from '@/types';
import { createColumnConfig, getFilterWithNewType } from '@/utils';

import { FilterDrawer } from '../FilterDrawer';
import { DrawerColumnManager } from './DrawerColumnManager';

/**
 * Props
 */
type BaseProps = {
  data: unknown[];
  columns: Array<ColumnDef<any>>;
  grouping?: GroupingState;
  expanded?: ExpandedState;
  editingRowIndex?: number;
  columnPinning?: ColumnPinningState;
};

type Props = BaseProps & Omit<React.ComponentProps<typeof DrawerColumnManager>, 'table'>;

const inTestIds = {
  filterDrawer: createSelector('data-testid filter-drawer'),
};

const createFilterMock =
  (testId: string) =>
  // eslint-disable-next-line react/display-name
  ({ updatePreferencesWithFilters }: any) => {
    return (
      <button
        value=""
        data-testid={testId}
        onDrop={(event: any) => {
          updatePreferencesWithFilters(event.dataTransfer.name, event.dataTransfer.value);
        }}
      />
    );
  };

const FilterDrawerMock = createFilterMock(inTestIds.filterDrawer.selector());

/**
 * Mock filters
 */
jest.mock('../FilterDrawer', () => ({
  FilterDrawer: jest.fn(),
}));

describe('Drawer Columns', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.drawerColumnManager, ...inTestIds });
  const selectors = getSelectors(screen);

  const updateTablesPreferences = jest.fn();

  /**
   * Wrapper
   */
  const Wrapper = (props: Partial<Props>) => {
    return (
      <DrawerColumnManager
        updateTablesPreferences={updateTablesPreferences}
        currentTableName=""
        userPreferences={{}}
        advancedSettings={{
          showFiltersInColumnManager: true,
          isColumnManagerAvailable: true,
          saveUserPreference: true,
        }}
        {...(props as any)}
      />
    );
  };

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <Wrapper {...props} />;
  };

  /**
   * Default column A
   */
  const nameColumn = createColumnConfig({
    label: 'Name',
    field: {
      source: 'A',
      name: 'name',
    },
    filter: {
      enabled: true,
      mode: ColumnFilterMode.CLIENT,
      variable: '',
    },
  });

  /**
   * Default Column B
   */
  const valueColumn = createColumnConfig({
    field: {
      source: 'A',
      name: 'value',
    },
    filter: {
      enabled: true,
      mode: ColumnFilterMode.CLIENT,
      variable: '',
    },
  });

  const defaultHeaders = [
    {
      id: 'firstGroup',
      headers: [
        {
          id: 'name',
          getContext: () =>
            ({
              label: 'Name',
            }) as any,
          column: {
            id: 'name',
            getIsSorted: jest.fn(),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
            },
          } as any,
        } as any,
        {
          id: 'value',
          getContext: () =>
            ({
              label: 'Value',
            }) as any,
          column: {
            id: 'value',
            getIsSorted: jest.fn(),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
            },
          } as any,
        } as any,
      ],
    },
  ] as any;

  /**
   * Create Filter Value
   * @param params
   */
  const createFilterValue = (params: Partial<ColumnFilterValue>): ColumnFilterValue =>
    ({
      ...getFilterWithNewType(params?.type || 'none'),
      ...params,
    }) as never;

  /**
   * Trigger Filter Change
   */
  const triggerFilterChange = (element: HTMLElement, columnName: string, filterValue: ColumnFilterValue): void => {
    fireEvent.drop(element, {
      dataTransfer: {
        name: columnName,
        value: filterValue,
      },
    });
  };

  beforeEach(() => {
    jest.mocked(FilterDrawer).mockImplementation(FilterDrawerMock);
  });

  it('Should render component', async () => {
    await act(async () => render(getComponent({})));

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should render Items', async () => {
    await act(async () =>
      render(
        getComponent({
          drawerColumns: [nameColumn, valueColumn],
          headers: defaultHeaders,
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.columnItem(false, 'name')).toBeInTheDocument();
    expect(selectors.columnItem(false, 'value')).toBeInTheDocument();
  });

  it('Should hide item', async () => {
    const updateTablesPreferences = jest.fn();

    await act(async () =>
      render(
        getComponent({
          currentTableName: 'Test Table',
          updateTablesPreferences,
          drawerColumns: [nameColumn, valueColumn],
          headers: defaultHeaders,
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.buttonToggleVisibility(false, 'name')).toBeInTheDocument();

    /**
     * Hide
     */
    await act(() => fireEvent.click(selectors.buttonToggleVisibility(false, 'name')));

    expect(updateTablesPreferences).toHaveBeenCalledWith('Test Table', [
      { enabled: false, filter: null, name: 'name' },
      { enabled: true, filter: null, name: 'value' },
    ]);
  });

  it('Should show item', async () => {
    const updateTablesPreferences = jest.fn();

    await act(async () =>
      render(
        getComponent({
          currentTableName: 'Test Table',
          updateTablesPreferences,
          drawerColumns: [{ ...nameColumn, enabled: false }, valueColumn],
          headers: defaultHeaders,
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.buttonToggleVisibility(false, 'name')).toBeInTheDocument();

    /**
     * Hide
     */
    await act(() => fireEvent.click(selectors.buttonToggleVisibility(false, 'name')));

    expect(updateTablesPreferences).toHaveBeenCalledWith('Test Table', [
      { enabled: true, filter: null, name: 'name' },
      { enabled: true, filter: null, name: 'value' },
    ]);
  });

  it('Should show Filter section', async () => {
    const updateTablesPreferences = jest.fn();

    await act(async () =>
      render(
        getComponent({
          currentTableName: 'Test Table',
          updateTablesPreferences,
          drawerColumns: [{ ...nameColumn, enabled: false }, valueColumn],
          headers: defaultHeaders,
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.columnItemFilter(false, 'name')).toBeInTheDocument();
  });

  it('Should allow to change filters', async () => {
    const updateTablesPreferences = jest.fn();

    await act(async () =>
      render(
        getComponent({
          currentTableName: 'Test Table',
          updateTablesPreferences,
          drawerColumns: [{ ...nameColumn, enabled: true }, valueColumn],
          headers: defaultHeaders,
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.columnItemFilter(false, 'name')).toBeInTheDocument();
    const drawers = screen.queryAllByTestId('data-testid filter-drawer');
    expect(drawers[0]).toBeInTheDocument();

    const filterValue = createFilterValue({
      type: ColumnFilterType.SEARCH,
      value: 'test',
    });

    triggerFilterChange(drawers[0], 'name', filterValue);

    expect(updateTablesPreferences).toHaveBeenCalled();

    expect(updateTablesPreferences).toHaveBeenCalledWith('Test Table', [
      { enabled: true, filter: filterValue, name: 'name' },
      { enabled: true, filter: null, name: 'value' },
    ]);
  });

  it('Should allow to change filters with preferences and update preferences', async () => {
    const updateTablesPreferences = jest.fn();

    await act(async () =>
      render(
        getComponent({
          currentTableName: 'Table',
          updateTablesPreferences,
          drawerColumns: [{ ...nameColumn, enabled: true }],
          headers: defaultHeaders,
          userPreferences: {
            tables: [
              {
                name: 'Table',
                columns: [
                  {
                    name: 'name',
                    enabled: true,
                    filter: null,
                  },
                  {
                    name: 'value',
                    enabled: true,
                    filter: null,
                  },
                ],
              },
            ],
          },
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.columnItemFilter(false, 'name')).toBeInTheDocument();

    expect(selectors.filterDrawer()).toBeInTheDocument();

    const filterValue = createFilterValue({
      type: ColumnFilterType.SEARCH,
      value: 'test',
    });

    triggerFilterChange(selectors.filterDrawer(), 'name', filterValue);

    expect(updateTablesPreferences).toHaveBeenCalled();

    expect(updateTablesPreferences).toHaveBeenCalledWith('Table', [
      { enabled: true, filter: filterValue, name: 'name' },
      { enabled: true, filter: null, name: 'value' },
    ]);
  });

  it('Should reorder items', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};
    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });
    const updateTablesPreferences = jest.fn();

    await act(async () =>
      render(
        getComponent({
          updateTablesPreferences,
          drawerColumns: [nameColumn, valueColumn],
          headers: defaultHeaders,
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();

    /**
     * Simulate drop field 1 to index 0
     */
    act(() =>
      onDragEndHandler({
        destination: {
          index: 0,
        },
        source: {
          index: 1,
        },
      } as any)
    );

    expect(updateTablesPreferences).toHaveBeenCalledWith('', [
      { enabled: true, filter: null, name: 'value' },
      { enabled: true, filter: null, name: 'name' },
    ]);
  });

  it('Should not reorder items if drop outside the list', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};
    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });
    const updateTablesPreferences = jest.fn();

    await act(async () =>
      render(
        getComponent({
          updateTablesPreferences,
          drawerColumns: [nameColumn, valueColumn],
          headers: defaultHeaders,
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();

    /**
     * Simulate drop field 1 to outside the list
     */
    act(() =>
      onDragEndHandler({
        destination: null,
        source: {
          index: 1,
        },
      } as any)
    );

    expect(updateTablesPreferences).not.toHaveBeenCalled();
  });

  describe('Tags', () => {
    it('Should show pinned left', async () => {
      await act(async () =>
        render(
          getComponent({
            drawerColumns: [{ ...nameColumn, pin: ColumnPinDirection.LEFT }, valueColumn],
            headers: defaultHeaders,
          })
        )
      );

      expect(selectors.root()).toBeInTheDocument();

      expect(selectors.columnItem(false, 'name')).toBeInTheDocument();
      expect(selectors.columnItem(false, 'name')).toHaveTextContent('name [Name]Pinned: Left');
      expect(selectors.columnItem(false, 'value')).toBeInTheDocument();
    });

    it('Should show pinned Right', async () => {
      await act(async () =>
        render(
          getComponent({
            drawerColumns: [{ ...nameColumn, pin: ColumnPinDirection.RIGHT }, valueColumn],
            headers: defaultHeaders,
          })
        )
      );

      expect(selectors.root()).toBeInTheDocument();

      expect(selectors.columnItem(false, 'name')).toBeInTheDocument();
      expect(selectors.columnItem(false, 'name')).toHaveTextContent('name [Name]Pinned: Right');
      expect(selectors.columnItem(false, 'value')).toBeInTheDocument();
    });
  });
});
