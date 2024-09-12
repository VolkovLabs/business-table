import { toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { QueryOptionsEditor } from './QueryOptionsEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof QueryOptionsEditor>;

describe('QueryOptionsEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();
  const frameA = toDataFrame({
    refId: 'A',
    fields: [
      {
        name: 'value',
        values: [],
      },
      {
        name: 'label',
        values: [],
      },
      {
        name: 'valueA',
        values: [],
      },
    ],
  });
  const frameWithIndex = toDataFrame({
    fields: [
      {
        name: 'value1',
        values: [],
      },
      {
        name: 'label1',
        values: [],
      },
    ],
  });

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.queryOptionsEditor);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <QueryOptionsEditor value={{}} onChange={onChange} data={[frameA, frameWithIndex]} {...(props as any)} />;
  };

  describe('By RefId', () => {
    it('Should allow to choose field for value', () => {
      render(getComponent({}));

      expect(selectors.fieldValue()).toBeInTheDocument();

      fireEvent.change(selectors.fieldValue(), { target: { value: 'A:value' } });

      expect(onChange).toHaveBeenCalledWith({
        label: null,
        source: frameA.refId,
        value: frameA.fields[0].name,
      });
    });

    it('Should allow to choose field for label', () => {
      render(
        getComponent({
          value: {
            source: frameA.refId!,
            value: frameA.fields[0].name,
            label: null,
          },
        })
      );

      expect(selectors.fieldLabel()).toBeInTheDocument();

      fireEvent.change(selectors.fieldLabel(), { target: { value: 'A:label' } });

      expect(onChange).toHaveBeenCalledWith({
        label: frameA.fields[1].name,
        source: frameA.refId,
        value: frameA.fields[0].name,
      });
    });
  });

  describe('By Index', () => {
    it('Should allow to choose field for value', () => {
      render(getComponent({}));

      expect(selectors.fieldValue()).toBeInTheDocument();

      fireEvent.change(selectors.fieldValue(), { target: { value: '1:value1' } });

      expect(onChange).toHaveBeenCalledWith({
        label: null,
        source: 1,
        value: frameWithIndex.fields[0].name,
      });
    });

    it('Should allow to choose field for label', () => {
      render(
        getComponent({
          value: {
            source: 1,
            value: frameWithIndex.fields[0].name,
            label: null,
          },
        })
      );

      expect(selectors.fieldLabel()).toBeInTheDocument();

      fireEvent.change(selectors.fieldLabel(), { target: { value: '1:label1' } });

      expect(onChange).toHaveBeenCalledWith({
        label: frameWithIndex.fields[1].name,
        source: 1,
        value: frameWithIndex.fields[0].name,
      });
    });
  });

  it('Should allow to clean value field', () => {
    render(
      getComponent({
        value: {
          source: frameA.refId!,
          value: frameA.fields[0].name,
          label: null,
        },
      })
    );

    fireEvent.change(selectors.fieldValue(), { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('Should allow to clean label field', () => {
    render(
      getComponent({
        value: {
          source: frameA.refId!,
          value: frameA.fields[0].name,
          label: frameA.fields[1].name,
        },
      })
    );

    fireEvent.change(selectors.fieldLabel(), { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith({
      source: frameA.refId!,
      value: frameA.fields[0].name,
      label: null,
    });
  });

  it('Should keep label field if same source for value', () => {
    render(
      getComponent({
        value: {
          source: frameA.refId!,
          value: frameA.fields[0].name,
          label: frameA.fields[1].name,
        },
      })
    );

    fireEvent.change(selectors.fieldValue(), { target: { value: 'A:valueA' } });

    expect(onChange).toHaveBeenCalledWith({
      source: frameA.refId!,
      value: frameA.fields[2].name,
      label: frameA.fields[1].name,
    });
  });
});
