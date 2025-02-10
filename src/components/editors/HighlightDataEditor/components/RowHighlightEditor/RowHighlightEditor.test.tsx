import { getTemplateSrv } from '@grafana/runtime';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { ScrollToRowPosition } from '@/types';
import { createColumnConfig, createRowHighlightConfig, createVariable } from '@/utils';

import { RowHighlightEditor, testIds } from './RowHighlightEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof RowHighlightEditor>;

describe('RowHighlightEditor', () => {
  /**
   * Defaults
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(testIds);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <RowHighlightEditor onChange={onChange} columns={[]} value={createRowHighlightConfig({})} {...props} />;
  };

  beforeEach(() => {
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([]);
  });

  it('Should allow to change column', () => {
    render(
      getComponent({
        columns: [
          createColumnConfig({
            field: {
              source: 'A',
              name: 'device',
            },
          }),
        ],
      })
    );

    expect(selectors.fieldColumn()).toBeInTheDocument();

    fireEvent.change(selectors.fieldColumn(), { target: { value: 'A:device' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        columnId: 'A:device',
      })
    );
  });

  it('Should allow to clean column', () => {
    render(
      getComponent({
        value: createRowHighlightConfig({
          columnId: 'A:device',
        }),
        columns: [
          createColumnConfig({
            field: {
              source: 'A',
              name: 'device',
            },
          }),
        ],
      })
    );

    expect(selectors.fieldColumn()).toBeInTheDocument();

    fireEvent.change(selectors.fieldColumn(), { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        columnId: '',
      })
    );
  });

  it('Should allow to change variable', () => {
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([
      createVariable({
        name: 'device',
      }),
    ]);

    render(getComponent({}));

    expect(selectors.fieldVariable()).toBeInTheDocument();

    fireEvent.change(selectors.fieldVariable(), { target: { value: 'device' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        variable: 'device',
      })
    );
  });

  it('Should allow to clean variable', () => {
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([
      createVariable({
        name: 'device',
      }),
    ]);

    render(
      getComponent({
        value: createRowHighlightConfig({
          variable: 'device',
        }),
      })
    );

    expect(selectors.fieldVariable()).toBeInTheDocument();

    fireEvent.change(selectors.fieldVariable(), { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        variable: '',
      })
    );
  });

  it('Should allow to change background color', () => {
    render(getComponent({}));

    expect(selectors.fieldBackgroundColor()).toBeInTheDocument();

    fireEvent.change(selectors.fieldBackgroundColor(), { target: { value: 'red' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        backgroundColor: 'red',
      })
    );
  });

  it('Should allow to change scroll to', () => {
    render(getComponent({}));

    expect(selectors.fieldScrollTo()).toBeInTheDocument();

    fireEvent.click(selectors.scrollToOption(false, ScrollToRowPosition.CENTER));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        scrollTo: ScrollToRowPosition.CENTER,
      })
    );
  });
});
