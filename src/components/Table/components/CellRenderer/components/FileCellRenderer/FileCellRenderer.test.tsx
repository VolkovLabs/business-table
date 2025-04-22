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

  it('Should render error icon and disable button if no value', () => {
    render(
      getComponent({
        config: createColumnConfig({
          fileCell: {
            size: undefined,
            variant: undefined,
            text: 'test',
          } as any,
        }),
        field: createField({ display: undefined }),
        value: '',
      })
    );

    expect(selectors.buttonSave()).toBeInTheDocument();
    expect(selectors.error()).toBeInTheDocument();
    expect(selectors.buttonSave()).toBeDisabled();
  });

  it('Should not render tooltip preview if option is not specified', () => {
    render(
      getComponent({
        config: createColumnConfig({
          fileCell: {
            text: 'test',
            displayPreview: false,
          } as any,
        }),
        field: createField({ display: undefined }),
        value:
          'JVBERi0xLjUKJeLjz9MKOCAwIG9iago8PAovVHlwZSAvRm9udERlc2NyaXB0b3IKL0ZvbnROYW1lIC9BcmlhbAovRmxhZ3MgMzIKL0l0YWxpY',
      })
    );

    expect(selectors.buttonSave()).toBeInTheDocument();
    expect(selectors.previewTooltip(true)).not.toBeInTheDocument();
  });

  it('Should render tooltip preview for pdf', () => {
    render(
      getComponent({
        config: createColumnConfig({
          fileCell: {
            text: 'test',
            displayPreview: true,
          } as any,
        }),
        field: createField({ display: undefined }),
        value:
          'JVBERi0xLjUKJeLjz9MKOCAwIG9iago8PAovVHlwZSAvRm9udERlc2NyaXB0b3IKL0ZvbnROYW1lIC9BcmlhbAovRmxhZ3MgMzIKL0l0YWxpY',
      })
    );

    expect(selectors.buttonSave()).toBeInTheDocument();
    expect(selectors.previewTooltip()).toBeInTheDocument();
    expect(selectors.previewPdf()).toBeInTheDocument();
  });

  it('Should render tooltip preview for image', () => {
    render(
      getComponent({
        config: createColumnConfig({
          fileCell: {
            text: 'test',
            displayPreview: true,
          } as any,
        }),
        field: createField({ display: undefined }),
        value:
          'iVBORw0KGgoAAAANSUhEUgAAANgAAADqCAYAAADAkotLAAAAAXNSR0IArs4c6QAA AFBlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6AB ',
      })
    );

    expect(selectors.buttonSave()).toBeInTheDocument();
    expect(selectors.previewTooltip()).toBeInTheDocument();
    expect(selectors.previewPdf(true)).not.toBeInTheDocument();
    expect(selectors.previewImage()).toBeInTheDocument();
  });
});
