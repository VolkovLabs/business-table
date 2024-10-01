import { fireEvent, render, screen, within } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { NestedObjectCardsDisplay, NestedObjectType } from '@/types';
import { createNestedObjectEditorConfig } from '@/utils';

import { NestedObjectCardsEditor } from './NestedObjectCardsEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof NestedObjectCardsEditor>;

describe('NestedObjectCardsEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.nestedObjectCardsEditor);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <NestedObjectCardsEditor
        value={createNestedObjectEditorConfig({ type: NestedObjectType.CARDS })}
        onChange={onChange}
        {...props}
      />
    );
  };

  describe('Data Settings', () => {
    it.each([
      {
        selector: selectors.fieldId,
        field: 'id',
        value: 'myId',
      },
      {
        selector: selectors.fieldTitle,
        field: 'title',
        value: 'myTitle',
      },
      {
        selector: selectors.fieldTime,
        field: 'time',
        value: 'myTime',
      },
      {
        selector: selectors.fieldAuthor,
        field: 'author',
        value: 'myAuthor',
      },
      {
        selector: selectors.fieldBody,
        field: 'body',
        value: 'myBody',
      },
    ])('Should allow to change $field', ({ selector, field, value }) => {
      render(
        getComponent({
          value: createNestedObjectEditorConfig({
            type: NestedObjectType.CARDS,
            [field]: '',
          }),
        })
      );

      expect(selector()).toBeInTheDocument();

      fireEvent.change(selector(), { target: { value } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          [field]: value,
        })
      );
    });
  });

  it('Should allow to change display', () => {
    render(
      getComponent({
        value: createNestedObjectEditorConfig({
          type: NestedObjectType.CARDS,
          display: NestedObjectCardsDisplay.NONE,
        }),
      })
    );

    const field = selectors.fieldDisplay();

    expect(field).toBeInTheDocument();

    fireEvent.click(getSelectors(within(field)).option(false, NestedObjectCardsDisplay.LAST));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        display: NestedObjectCardsDisplay.LAST,
      })
    );
  });

  it('Should allow to change display count', () => {
    render(
      getComponent({
        value: createNestedObjectEditorConfig({
          type: NestedObjectType.CARDS,
          display: NestedObjectCardsDisplay.LAST,
          displayCount: 0,
        }),
      })
    );

    expect(selectors.fieldDisplayCount()).toBeInTheDocument();

    fireEvent.change(selectors.fieldDisplayCount(), { target: { value: '10' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        displayCount: 10,
      })
    );
  });

  it('Should allow to change all display count', () => {
    render(
      getComponent({
        value: createNestedObjectEditorConfig({
          type: NestedObjectType.CARDS,
          display: NestedObjectCardsDisplay.LAST,
          displayCount: 0,
        }),
      })
    );

    expect(selectors.fieldDisplayCount()).toBeInTheDocument();

    fireEvent.change(selectors.fieldDisplayCount(), { target: { value: '0' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        displayCount: null,
      })
    );
  });

  it('Should not allow to change display count if disabled', () => {
    render(
      getComponent({
        value: createNestedObjectEditorConfig({
          type: NestedObjectType.CARDS,
          display: NestedObjectCardsDisplay.NONE,
        }),
      })
    );

    expect(selectors.fieldDisplayCount(true)).not.toBeInTheDocument();
  });
});
