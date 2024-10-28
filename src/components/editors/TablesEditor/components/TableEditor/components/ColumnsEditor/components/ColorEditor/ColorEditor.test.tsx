import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { ColorEditor } from './ColorEditor';

type Props = React.ComponentProps<typeof ColorEditor>;

describe('ColumnEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.columnEditor });
  const selectors = getSelectors(screen);

  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Get component
   */
  const getComponent = ({ ...restProps }: Partial<Props>) => {
    return <ColorEditor {...(restProps as any)} />;
  };

  it('Should allow to reset color', () => {
    render(getComponent({ value: '#ffffff', label: 'Change color', name: 'color', onChange }));

    expect(selectors.fieldAppearanceColor(false, 'color')).toBeInTheDocument();
    expect(selectors.buttonRemoveColor(false, 'color')).toBeInTheDocument();

    fireEvent.click(selectors.buttonRemoveColor(false, 'color'));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
