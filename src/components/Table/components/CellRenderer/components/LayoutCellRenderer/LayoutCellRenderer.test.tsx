import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { tablePanelContext } from '@/hooks';

import { LayoutCellRenderer } from './LayoutCellRenderer';

type Props = React.ComponentProps<typeof LayoutCellRenderer>;

describe('LayoutCellRenderer', () => {
  /**
   * replaceVariables
   */
  const replaceVariables = jest.fn();

  /**
   * setError
   */
  const setError = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.layoutCellRenderer);
  const selectors = getSelectors(screen);

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <tablePanelContext.Provider value={{ replaceVariables, setError }}>
        <LayoutCellRenderer value={jest.fn()} {...(props as any)} />;
      </tablePanelContext.Provider>
    );
  };

  beforeEach(() => {
    replaceVariables.mockImplementation((str: string) => str);
  });

  it('Should render value', () => {
    render(getComponent({ value: '<p>text</p>', row: { original: { id: '4' } } as any }));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveTextContent('text');
  });
});
