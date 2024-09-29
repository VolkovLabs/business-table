import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { ACTIONS_COLUMN_ID, TEST_IDS } from '@/constants';

import { TableHeaderCell } from './TableHeaderCell';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TableHeaderCell>;

describe('TableHeaderCell', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.tableHeaderCell, ['sortIcon']);
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
      })
    );

    expect(selectors.root(true)).not.toBeInTheDocument();
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
});
