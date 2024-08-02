import { toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';
import { TEST_IDS } from '../../constants';
import { CellAggregation, CellType } from '../../types';
import { createColumnConfig } from '../../utils';
import { ColumnEditor } from './ColumnEditor';

type Props = React.ComponentProps<typeof ColumnEditor>;

describe('ColumnEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.columnEditor);
  const selectors = getSelectors(screen);

  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Data
   */
  const frame = toDataFrame({
    fields: [
      {
        name: 'device',
      },
    ],
  });

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <ColumnEditor value={createColumnConfig()} onChange={onChange} data={[frame]} {...(props as any)} />;
  };

  it('Should allow to change label', () => {
    render(getComponent({ value: createColumnConfig({ label: '123' }) }));

    expect(selectors.fieldLabel()).toBeInTheDocument();
    expect(selectors.fieldLabel()).toHaveValue('123');

    fireEvent.change(selectors.fieldLabel(), { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'hello',
      })
    );
  });

  it('Should allow to change type', () => {
    render(getComponent({ value: createColumnConfig({ type: CellType.COLORED_TEXT }) }));

    expect(selectors.fieldType()).toBeInTheDocument();
    expect(selectors.fieldType()).toHaveValue(CellType.COLORED_TEXT);

    fireEvent.change(selectors.fieldType(), { target: { value: CellType.AUTO } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: CellType.AUTO,
      })
    );
  });

  it('Should allow to change group', () => {
    render(getComponent({ value: createColumnConfig({ group: false }) }));

    expect(selectors.fieldGroup()).toBeInTheDocument();
    expect(selectors.fieldGroup()).not.toBeChecked();

    fireEvent.click(selectors.fieldGroup());

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        group: true,
      })
    );
  });

  it('Should hide aggregation if group', () => {
    render(getComponent({ value: createColumnConfig({ group: true }) }));

    expect(selectors.fieldAggregation(true)).not.toBeInTheDocument();
  });

  it('Should allow to change aggregation', () => {
    render(getComponent({ value: createColumnConfig({ group: false, aggregation: CellAggregation.UNIQUE_COUNT }) }));

    expect(selectors.fieldAggregation()).toBeInTheDocument();
    expect(selectors.fieldAggregation()).toHaveValue(CellAggregation.UNIQUE_COUNT);

    fireEvent.change(selectors.fieldAggregation(), { target: { value: CellAggregation.MAX } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregation: CellAggregation.MAX,
      })
    );
  });
});
