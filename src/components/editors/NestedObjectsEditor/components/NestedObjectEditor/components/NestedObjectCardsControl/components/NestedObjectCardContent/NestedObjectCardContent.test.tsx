import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { NestedObjectCardContent } from './NestedObjectCardContent';

/**
 * Props
 */
type Props = React.ComponentProps<typeof NestedObjectCardContent>;

describe('NestedObjectCardContent', () => {
  /**
   * Replace Variables
   */
  const replaceVariables = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.nestedObjectCardContent);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <NestedObjectCardContent replaceVariables={replaceVariables} text="" {...props} />;
  };

  beforeEach(() => {
    replaceVariables.mockImplementation((str: string) => str);
  });

  it('Should render markdown', () => {
    render(
      getComponent({
        text: '# Hello',
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toContainHTML('<h1>Hello</h1>');
  });

  it('Should replace variables', () => {
    replaceVariables.mockReturnValue('John');

    render(
      getComponent({
        text: `$name`,
      })
    );

    expect(selectors.root()).toHaveTextContent('John');
  });
});
