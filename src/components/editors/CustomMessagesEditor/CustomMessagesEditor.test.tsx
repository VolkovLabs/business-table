import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createCustomMessagesConfig } from '@/utils';

import { CustomMessagesEditor } from './CustomMessagesEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof CustomMessagesEditor>;

describe('CustomMessagesEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.customMessagesEditor);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <CustomMessagesEditor value={createCustomMessagesConfig({})} onChange={onChange} {...(props as any)} />;
  };

  it('Should allow to set title', () => {
    render(
      getComponent({
        value: createCustomMessagesConfig({
          confirmationTitle: '',
        }),
      })
    );

    expect(selectors.fieldTitle()).toBeInTheDocument();

    fireEvent.change(selectors.fieldTitle(), { target: { value: 'New Title' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmationTitle: 'New Title',
      })
    );
  });

  it('Should allow to set message', () => {
    render(
      getComponent({
        value: createCustomMessagesConfig({}),
      })
    );

    expect(selectors.fieldMessage()).toBeInTheDocument();

    fireEvent.change(selectors.fieldMessage(), { target: { value: 'New message' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmationMessage: 'New message',
      })
    );
  });

  it('Should allow to set notify message', () => {
    render(
      getComponent({
        value: createCustomMessagesConfig({}),
      })
    );

    expect(selectors.fieldNotify()).toBeInTheDocument();

    fireEvent.change(selectors.fieldNotify(), { target: { value: 'New notify message' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        notifyMessage: 'New notify message',
      })
    );
  });
});
