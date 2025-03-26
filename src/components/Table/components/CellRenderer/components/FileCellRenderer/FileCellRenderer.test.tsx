import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import { saveAs } from 'file-saver';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createColumnConfig, createField } from '@/utils';

import { FileCellRenderer } from './FileCellRenderer';

/**
 * file-saver mock
 */
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

type Props = React.ComponentProps<typeof FileCellRenderer>;

describe('FileCellRenderer', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.fileCellRenderer);
  const selectors = getSelectors(screen);

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <FileCellRenderer renderValue={jest.fn()} {...(props as any)} />;
  };

  it('Should render component', () => {
    render(
      getComponent({
        config: createColumnConfig(),
        field: createField({ display: undefined }),
        value: 'invalid_base64',
      })
    );

    expect(selectors.buttonSave()).toBeInTheDocument();
  });

  it('Should call save handler', () => {
    render(
      getComponent({
        config: createColumnConfig(),
        field: createField({ display: undefined }),
        value: 'invalid_base64',
      })
    );

    expect(selectors.buttonSave()).toBeInTheDocument();

    fireEvent.click(selectors.buttonSave());

    expect(saveAs).toHaveBeenCalled();
  });
});
