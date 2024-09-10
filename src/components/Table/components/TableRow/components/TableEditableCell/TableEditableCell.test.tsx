import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnEditorType } from '@/types';

import { TableEditableCell } from './TableEditableCell';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TableEditableCell>;

describe('TableEditableCell', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.editableCell);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TableEditableCell onChange={onChange} {...(props as any)} />;
  };

  it('Should work if no editor', () => {
    render(getComponent({ column: { columnDef: { meta: { editor: null } } } as any }));

    expect(selectors.fieldString(true)).not.toBeInTheDocument();
  });

  it('Should work if no control', () => {
    render(getComponent({ column: { columnDef: { meta: { editor: { type: 'unknown' } } } } as any }));

    expect(selectors.fieldString(true)).not.toBeInTheDocument();
  });

  it('Should allow to update value', () => {
    const row = {
      getValue: (columnId: string) => columnId,
    };

    render(
      getComponent({
        column: { id: 'value', columnDef: { meta: { editor: { type: ColumnEditorType.STRING } } } } as any,
        row: row as any,
      })
    );

    expect(selectors.fieldString()).toBeInTheDocument();
    expect(selectors.fieldString()).toHaveValue('value');

    fireEvent.change(selectors.fieldString(), { target: { value: '123' } });

    expect(onChange).toHaveBeenCalledWith(row, {
      columnId: 'value',
      value: '123',
    });
  });
});
