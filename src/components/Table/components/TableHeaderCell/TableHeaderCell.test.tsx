import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { ACTIONS_COLUMN_ID } from '@/constants';
import { createColumnConfig, createColumnMeta } from '@/utils';

import { TableHeaderCell, testIds } from './TableHeaderCell';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TableHeaderCell>;

describe('TableHeaderCell', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(testIds, ['sortIcon']);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TableHeaderCell {...(props as any)} />;
  };

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

  it('Should show available sorting icon icon', () => {
    render(
      getComponent({
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => 'desc'),
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
            getIsSorted: jest.fn(() => 'desc'),
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

    fireEvent.click(selectors.root());
    expect(setDrawerOpen).toHaveBeenCalled();
  });

  it('Should call handle sort if UI manager is not available', () => {
    const setDrawerOpen = jest.fn();
    const getToggleSortingHandler = jest.fn();

    render(
      getComponent({
        setDrawerOpen: setDrawerOpen,
        advancedSettings: {
          isColumnManagerAvailable: false,
          showFiltersInColumnManager: false,
          showSortInColumnManager: false,
          saveUserPreference: true,
        },
        header: {
          getContext: () =>
            ({
              label: '123',
            }) as any,
          column: {
            getIsSorted: jest.fn(() => 'desc'),
            getCanSort: jest.fn(() => true),
            getToggleSortingHandler: getToggleSortingHandler,
            columnDef: {
              header: ({ label }: any) => label,
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
