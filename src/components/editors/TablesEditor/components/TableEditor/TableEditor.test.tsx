import { getTemplateSrv } from '@grafana/runtime';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createColumnConfig, createTableConfig } from '@/utils';

import { TableEditor } from './TableEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof TableEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  columnsEditor: createSelector('data-testid columns-editor'),
};

/**
 * Mock Columns Editor
 */
jest.mock('./components', () => ({
  ColumnsEditor: ({ value, onChange }: any) => (
    <input {...inTestIds.columnsEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

describe('TableEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.tableEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TableEditor onChange={onChange} data={[]} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([]);
  });

  it('Should allow to change columns', () => {
    render(
      getComponent({
        value: createTableConfig({
          items: [createColumnConfig({})],
        }),
      })
    );

    expect(selectors.columnsEditor()).toBeInTheDocument();

    fireEvent.change(selectors.columnsEditor(), { target: { value: '123' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [createColumnConfig({})],
      })
    );
  });

  it('Should allow to change header visibility', () => {
    render(
      getComponent({
        value: createTableConfig({
          showHeader: true,
          items: [createColumnConfig({})],
        }),
      })
    );

    expect(selectors.fieldShowHeader()).toBeInTheDocument();
    fireEvent.click(selectors.fieldShowHeader());

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        showHeader: false,
        items: [createColumnConfig({})],
      })
    );
  });
});
