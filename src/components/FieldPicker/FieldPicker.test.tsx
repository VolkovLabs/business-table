import { FieldType, toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { FieldPicker } from './FieldPicker';

/**
 * Props
 */
type Props = React.ComponentProps<typeof FieldPicker>;

describe('FieldPicker', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Frames
   */
  const frameA = toDataFrame({
    refId: 'A',
    fields: [
      {
        name: 'name',
        type: FieldType.string,
        values: [],
      },
      {
        name: 'value',
        type: FieldType.number,
        values: [],
      },
    ],
  });
  const frameWithIndex = toDataFrame({
    fields: [
      {
        name: 'name',
        type: FieldType.string,
        values: [],
      },
      {
        name: 'value',
        type: FieldType.number,
        values: [],
      },
    ],
  });

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.fieldPicker);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <FieldPicker onChange={onChange} data={[frameA, frameWithIndex]} {...props} />;
  };

  it('Should work if no value', () => {
    render(getComponent({ value: undefined }));

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should allow to select field', () => {
    render(getComponent({ value: { source: 1, name: 'value' } }));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveValue('1:value');

    fireEvent.change(selectors.root(), { target: { value: 'A:name' } });

    expect(onChange).toHaveBeenCalledWith({
      source: 'A',
      name: 'name',
    });
  });

  it('Should allow to clean value', () => {
    render(getComponent({ value: { source: 1, name: 'value' } }));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveValue('1:value');

    fireEvent.change(selectors.root(), { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('Should allow to select fields based on already selected', () => {
    render(getComponent({ alreadySelectedFields: [{ source: 'A', name: 'name' }] }));

    expect(selectors.root()).toBeInTheDocument();

    fireEvent.change(selectors.root(), { target: { value: 'A:value' } });

    expect(onChange).toHaveBeenCalledWith({
      source: 'A',
      name: 'value',
    });
  });

  it('Should filter all fields by type', () => {
    render(getComponent({ includeTypes: [FieldType.number] }));

    fireEvent.change(selectors.root(), { target: { value: '1:value' } });

    expect(onChange).toHaveBeenCalledWith({
      source: 1,
      name: 'value',
    });
  });

  it('Should filter selected fields by type', () => {
    render(getComponent({ alreadySelectedFields: [{ source: 1, name: 'value' }], includeTypes: [FieldType.string] }));

    fireEvent.change(selectors.root(), { target: { value: '1:name' } });

    expect(onChange).toHaveBeenCalledWith({
      source: 1,
      name: 'name',
    });
  });

  describe('without refId', () => {
    it('Should allow to select field', () => {
      render(getComponent({}));

      fireEvent.change(selectors.root(), { target: { value: '1:value' } });

      expect(onChange).toHaveBeenCalledWith({
        source: 1,
        name: 'value',
      });
    });

    it('Should allow to select field based on already selected', () => {
      render(getComponent({ alreadySelectedFields: [{ source: 1, name: 'value' }] }));

      fireEvent.change(selectors.root(), { target: { value: '1:name' } });

      expect(onChange).toHaveBeenCalledWith({
        source: 1,
        name: 'name',
      });
    });
  });
});
