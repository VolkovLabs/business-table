import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { ColorEditor, testIds } from './ColorEditor';

type Props = React.ComponentProps<typeof ColorEditor>;

describe('ColorEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(testIds);
  const selectors = getSelectors(screen);

  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <ColorEditor onChange={onChange} value={undefined} {...props} />;
  };

  it('Should allow to change value', () => {
    render(getComponent({ value: '#ffffff', onChange }));

    expect(selectors.fieldValue()).toBeInTheDocument();
    fireEvent.change(selectors.fieldValue(), { target: { value: '#000' } });
    expect(onChange).toHaveBeenCalledWith('#000');
  });

  it('Should allow to reset value', () => {
    render(getComponent({ value: '#ffffff', onChange }));

    expect(selectors.fieldValue()).toBeInTheDocument();
    expect(selectors.buttonClear()).toBeInTheDocument();

    fireEvent.click(selectors.buttonClear());
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('Should not allow to reset value if empty', () => {
    render(getComponent({ value: undefined, onChange }));

    expect(selectors.buttonClear(true)).not.toBeInTheDocument();
  });
});
