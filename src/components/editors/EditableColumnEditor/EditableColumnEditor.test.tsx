import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnEditorType } from '@/types';
import { createColumnEditConfig } from '@/utils';

import { EditableColumnEditor } from './EditableColumnEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof EditableColumnEditor>;

describe('EditableColumnEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.editableColumnEditor);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <EditableColumnEditor onChange={onChange} data={[]} {...(props as any)} />;
  };

  it('Should allow to change type', () => {
    render(getComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.NUMBER } }).editor }));

    expect(selectors.fieldType()).toBeInTheDocument();
    expect(selectors.fieldType()).toHaveValue(ColumnEditorType.NUMBER);

    fireEvent.change(selectors.fieldType(), { target: { value: ColumnEditorType.SELECT } });

    expect(onChange).toHaveBeenCalledWith({
      type: ColumnEditorType.SELECT,
    });
  });

  it('Should allow to change editor config', () => {
    render(getComponent({ value: createColumnEditConfig({ editor: { type: ColumnEditorType.NUMBER } }).editor }));

    expect(selectors.fieldType()).toHaveValue(ColumnEditorType.NUMBER);
    expect(selectors.fieldNumberMin()).toBeInTheDocument();

    fireEvent.change(selectors.fieldNumberMin(), { target: { value: '10' } });
    fireEvent.blur(selectors.fieldNumberMin(), { target: { value: '10' } });

    expect(onChange).toHaveBeenCalledWith({
      type: ColumnEditorType.NUMBER,
      min: 10,
    });
  });
});
