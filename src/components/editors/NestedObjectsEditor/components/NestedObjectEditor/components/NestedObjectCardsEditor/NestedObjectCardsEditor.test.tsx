import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { NestedObjectType } from '@/types';
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
