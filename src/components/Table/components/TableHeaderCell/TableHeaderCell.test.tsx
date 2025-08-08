import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { ACTIONS_COLUMN_ID } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';
import { createColumnConfig, createColumnMeta, getFilterWithNewType } from '@/utils';

import { TableHeaderCell, testIds } from './TableHeaderCell';
import { TableHeaderCellFilter } from './TableHeaderCellFilter';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TableHeaderCell>;

const inTestIds = {
  tableHeaderCellFilter: createSelector('data-testid table-header-cell-filter'),
};

const createTableHeaderCellFilterMock =
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

const TableHeaderCellFilterMock = createTableHeaderCellFilterMock(inTestIds.tableHeaderCellFilter.selector());

/**
 * Mock filters
 */
jest.mock('./TableHeaderCellFilter', () => ({
  TableHeaderCellFilter: jest.fn(),
}));

describe('TableHeaderCell', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...testIds, ...inTestIds }, ['sortIcon']);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TableHeaderCell {...(props as any)} />;
  };

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
    jest.mocked(TableHeaderCellFilter).mockImplementation(TableHeaderCellFilterMock);
  });

  it('Should render', () => {
    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('123');
  });

  it('Should render nothing if actions column', () => {
    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            id: ACTIONS_COLUMN_ID,
            getIsSorted: jest.fn(),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
            },
          } as any,
        } as any,
        isAddRowEnabled: false,
      })
    );

    expect(selectors.root(true)).not.toBeInTheDocument();
  });

  it('Should show available sorting icon', () => {
    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => false),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.tooltipIconSortAvailable(false)).toBeInTheDocument();
  });

  it('Should open drawer click on sort icon if UI manager available', () => {
    const setDrawerOpen = jest.fn();
    render(
      getComponent({
        setDrawerOpen: setDrawerOpen,
        advancedSettings: {
          isColumnManagerAvailable: true,
          showFiltersInColumnManager: false,
          showSortInColumnManager: true,
          saveUserPreference: true,
        },
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => false),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
              enableSorting: true,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.tooltipIconSortAvailable(false)).toBeInTheDocument();

    fireEvent.click(selectors.root());
    expect(setDrawerOpen).toHaveBeenCalled();
  });

  it('Should not open drawer click on sort icon if UI manager available but sorting is not specified for column', () => {
    const setDrawerOpen = jest.fn();
    render(
      getComponent({
        setDrawerOpen: setDrawerOpen,
        advancedSettings: {
          isColumnManagerAvailable: true,
          showFiltersInColumnManager: false,
          showSortInColumnManager: true,
          saveUserPreference: true,
        },
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => false),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
              enableSorting: false,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.tooltipIconSortAvailable(false)).toBeInTheDocument();

    fireEvent.click(selectors.root());
    expect(setDrawerOpen).not.toHaveBeenCalled();
  });

  it('Should call handle sort if UI manager is not available', () => {
    const setDrawerOpen = jest.fn();
    const getToggleSortingHandler = jest.fn();
    const updateTablesPreferences = jest.fn();

    render(
      getComponent({
        setDrawerOpen: setDrawerOpen,
        updateTablesPreferences: updateTablesPreferences,
        sorting: [],
        advancedSettings: {
          isColumnManagerAvailable: false,
          showFiltersInColumnManager: false,
          showSortInColumnManager: false,
          saveUserPreference: true,
        },
        userPreferences: {
          currentGroup: '',
          tables: [],
          options: {},
        },
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => false),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: getToggleSortingHandler,
            columnDef: {
              header: ({ label }: any) => label,
              enableSorting: true,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.tooltipIconSortAvailable(false)).toBeInTheDocument();

    fireEvent.click(selectors.root());
    expect(setDrawerOpen).not.toHaveBeenCalled();
    expect(getToggleSortingHandler).toHaveBeenCalled();
  });

  it('Should update preferences if saveUserPreference is true for sort and sort is available for column', () => {
    const setDrawerOpen = jest.fn();
    const getToggleSortingHandler = jest.fn();
    const updateTablesPreferences = jest.fn();

    render(
      getComponent({
        setDrawerOpen: setDrawerOpen,
        updateTablesPreferences: updateTablesPreferences,
        sorting: [],
        advancedSettings: {
          isColumnManagerAvailable: false,
          showFiltersInColumnManager: false,
          showSortInColumnManager: false,
          saveUserPreference: true,
        },
        currentTableName: 'test',
        userPreferences: {
          currentGroup: '',
          tables: [],
          options: {},
        },
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => false),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: getToggleSortingHandler,
            columnDef: {
              header: ({ label }: any) => label,
              enableSorting: true,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.tooltipIconSortAvailable(false)).toBeInTheDocument();

    fireEvent.click(selectors.root());

    expect(updateTablesPreferences).toHaveBeenCalled();
    expect(updateTablesPreferences).toHaveBeenCalledWith('test', []);
  });

  it('Should not update preferences if saveUserPreference is true for sort and sort is not specified for column', () => {
    const setDrawerOpen = jest.fn();
    const getToggleSortingHandler = jest.fn();
    const updateTablesPreferences = jest.fn();

    render(
      getComponent({
        setDrawerOpen: setDrawerOpen,
        updateTablesPreferences: updateTablesPreferences,
        sorting: [],
        advancedSettings: {
          isColumnManagerAvailable: false,
          showFiltersInColumnManager: false,
          showSortInColumnManager: false,
          saveUserPreference: true,
        },
        currentTableName: 'test',
        userPreferences: {
          currentGroup: '',
          tables: [],
          options: {},
        },
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => false),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: getToggleSortingHandler,
            columnDef: {
              header: ({ label }: any) => label,
              enableSorting: false,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.tooltipIconSortAvailable(false)).toBeInTheDocument();

    fireEvent.click(selectors.root());

    expect(updateTablesPreferences).not.toHaveBeenCalled();
  });

  it('Should display open settings in drawer if all filter and sorting are specified', () => {
    const setDrawerOpen = jest.fn();
    const getToggleSortingHandler = jest.fn();
    const updateTablesPreferences = jest.fn();

    render(
      getComponent({
        setDrawerOpen: setDrawerOpen,
        updateTablesPreferences: updateTablesPreferences,
        sorting: [],
        advancedSettings: {
          isColumnManagerAvailable: true,
          showFiltersInColumnManager: true,
          showSortInColumnManager: true,
          saveUserPreference: true,
        },
        userPreferences: {
          currentGroup: '',
          tables: [],
          options: {},
        },
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => false),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: getToggleSortingHandler,
            columnDef: {
              header: ({ label }: any) => label,
              enableSorting: true,
              enableColumnFilter: true,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.buttonOpenColumnManager()).toBeInTheDocument();
    expect(selectors.tooltipColumnManager()).toBeInTheDocument();

    fireEvent.click(selectors.buttonOpenColumnManager());
    expect(setDrawerOpen).toHaveBeenCalled();
  });

  it('Should update preferences if saveUserPreference is true for filter', () => {
    const setDrawerOpen = jest.fn();
    const getToggleSortingHandler = jest.fn();
    const updateTablesPreferences = jest.fn();

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

    render(
      getComponent({
        setDrawerOpen: setDrawerOpen,
        updateTablesPreferences: updateTablesPreferences,
        sorting: [],
        drawerColumns: [{ ...nameColumn, enabled: true }],
        advancedSettings: {
          isColumnManagerAvailable: false,
          showFiltersInColumnManager: false,
          showSortInColumnManager: false,
          saveUserPreference: true,
        },
        currentTableName: 'Test',
        userPreferences: {
          currentGroup: '',
          tables: [],
          options: {},
        },
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => false),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: getToggleSortingHandler,
            columnDef: {
              header: ({ label }: any) => label,
              enableColumnFilter: true,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.tableHeaderCellFilter()).toBeInTheDocument();

    const filterValue = createFilterValue({
      type: ColumnFilterType.SEARCH,
      value: 'test',
    });

    triggerFilterChange(selectors.tableHeaderCellFilter(), 'name', filterValue);

    expect(updateTablesPreferences).toHaveBeenCalled();

    expect(updateTablesPreferences).toHaveBeenCalledWith('Test', [
      { enabled: true, filter: filterValue, name: 'name', sort: { enabled: false, descFirst: false } },
    ]);
  });

  it('Should open drawer if showFiltersInColumnManager is true for filter', () => {
    const setDrawerOpen = jest.fn();
    const getToggleSortingHandler = jest.fn();
    const updateTablesPreferences = jest.fn();

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

    render(
      getComponent({
        setDrawerOpen: setDrawerOpen,
        updateTablesPreferences: updateTablesPreferences,
        sorting: [],
        drawerColumns: [{ ...nameColumn, enabled: true }],
        advancedSettings: {
          isColumnManagerAvailable: true,
          showFiltersInColumnManager: true,
          showSortInColumnManager: false,
          saveUserPreference: true,
        },
        currentTableName: 'Test',
        userPreferences: {
          currentGroup: '',
          tables: [],
          options: {},
        },
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => false),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: getToggleSortingHandler,
            getIsFiltered: jest.fn(() => true),
            columnDef: {
              header: ({ label }: any) => label,
              enableColumnFilter: true,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.tableHeaderCellFilter()).toBeInTheDocument();

    fireEvent.click(selectors.tableHeaderCellFilter());
    expect(setDrawerOpen).toHaveBeenCalled();
  });

  it('Should update preferences correct if saveUserPreference is true for filter and preferences doesn`t have tables', () => {
    const setDrawerOpen = jest.fn();
    const getToggleSortingHandler = jest.fn();
    const updateTablesPreferences = jest.fn();

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

    render(
      getComponent({
        setDrawerOpen: setDrawerOpen,
        updateTablesPreferences: updateTablesPreferences,
        sorting: [],
        drawerColumns: [{ ...nameColumn, enabled: true }],
        advancedSettings: {
          isColumnManagerAvailable: false,
          showFiltersInColumnManager: false,
          showSortInColumnManager: false,
          saveUserPreference: true,
        },
        currentTableName: 'Test',
        userPreferences: {
          currentGroup: '',
          tables: [],
          options: {},
        },
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => false),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: getToggleSortingHandler,
            columnDef: {
              header: ({ label }: any) => label,
              enableColumnFilter: true,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.tableHeaderCellFilter()).toBeInTheDocument();

    const filterValue = createFilterValue({
      type: ColumnFilterType.SEARCH,
      value: 'test',
    });

    triggerFilterChange(selectors.tableHeaderCellFilter(), 'name', filterValue);

    expect(updateTablesPreferences).toHaveBeenCalled();

    expect(updateTablesPreferences).toHaveBeenCalledWith('Test', [
      { enabled: true, filter: filterValue, name: 'name', sort: { enabled: false, descFirst: false } },
    ]);
  });

  it('Should show asc sort icon', () => {
    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => 'asc'),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.sortIcon(false, 'arrow-up')).toBeInTheDocument();
  });

  it('Should show tooltip', () => {
    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => 'asc'),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
              meta: createColumnMeta({
                config: createColumnConfig({
                  columnTooltip: 'Tooltip',
                }),
              }),
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.tooltip()).toBeInTheDocument();
  });

  it('Should not show tooltip if undefined', () => {
    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => 'asc'),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
              meta: createColumnMeta({
                config: createColumnConfig({
                  columnTooltip: undefined,
                }),
              }),
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.tooltip(true)).not.toBeInTheDocument();
  });

  it('Should not show tooltip if empty string in columnTooltip', () => {
    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => 'asc'),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
              meta: createColumnMeta({
                config: createColumnConfig({
                  columnTooltip: '',
                }),
              }),
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.tooltip(true)).not.toBeInTheDocument();
  });

  it('Should show desc sort icon', () => {
    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => 'desc'),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
            },
          } as any,
        } as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.sortIcon(false, 'arrow-down')).toBeInTheDocument();
  });

  it('Should allow to add row', () => {
    const onAddRow = jest.fn();

    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            id: ACTIONS_COLUMN_ID,
            getIsSorted: jest.fn(),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
            },
          } as any,
        } as any,
        isAddRowEnabled: true,
        onAddRow,
      })
    );

    expect(selectors.buttonAddRow()).toBeInTheDocument();
    fireEvent.click(selectors.buttonAddRow());

    expect(onAddRow).toHaveBeenCalled();
  });

  it('Should display text in action header', () => {
    const onAddRow = jest.fn();

    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: 'action header',
            }) as any,
          column: {
            id: ACTIONS_COLUMN_ID,
            getIsSorted: jest.fn(),
            getCanSort: jest.fn(),
            getToggleSortingHandler: jest.fn(),
            columnDef: {
              header: ({ label }: any) => label,
            },
          } as any,
        } as any,
        isAddRowEnabled: true,
        onAddRow,
      })
    );

    expect(selectors.actionHeaderText()).toBeInTheDocument();
    expect(selectors.actionHeaderText()).toHaveTextContent('action header');
  });
});
