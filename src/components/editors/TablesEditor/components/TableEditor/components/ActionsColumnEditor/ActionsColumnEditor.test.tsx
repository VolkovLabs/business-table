import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnAlignment, ColumnHeaderFontSize } from '@/types';
import { createActionsColumnConfig } from '@/utils';

import { ActionsColumnEditor } from './ActionsColumnEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof ActionsColumnEditor>;

describe('ActionsColumnEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.actionColumnsEditor });
  const selectors = getSelectors(screen);

  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Get Tested Component
   * @param props
   */
  const getComponent = (props: Partial<Props>) => <ActionsColumnEditor name="Default" data={[]} {...(props as any)} />;

  const openSection = () => {
    expect(selectors.itemHeader()).toBeInTheDocument();

    fireEvent.click(selectors.itemHeader());
  };

  const defaultValue = createActionsColumnConfig({
    width: {
      auto: false,
      value: 0,
    },
    label: 'Actions',
    fontSize: undefined,
  });

  it('Should render editor', () => {
    render(
      getComponent({
        onChange,
        value: defaultValue,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should change name', () => {
    render(
      getComponent({
        onChange,
        value: defaultValue,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    openSection();

    expect(selectors.fieldLabel()).toBeInTheDocument();

    fireEvent.change(selectors.fieldLabel(), { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ...defaultValue,
        label: 'hello',
      })
    );
  });

  it('Should change fontSize', () => {
    render(
      getComponent({
        onChange,
        value: defaultValue,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    openSection();

    expect(selectors.fieldHeaderFontSize()).toBeInTheDocument();

    fireEvent.click(selectors.fieldHeaderFontSizeOption(false, ColumnHeaderFontSize.MD));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ...defaultValue,
        fontSize: ColumnHeaderFontSize.MD,
      })
    );
  });

  it('Should change alignment', () => {
    render(
      getComponent({
        onChange,
        value: defaultValue,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    openSection();

    expect(selectors.fieldAppearanceAlignment()).toBeInTheDocument();

    fireEvent.click(selectors.fieldAppearanceAlignmentOption(false, ColumnAlignment.END));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ...defaultValue,
        alignment: ColumnAlignment.END,
      })
    );
  });

  it('Should toggle auto width', () => {
    render(
      getComponent({
        onChange,
        value: defaultValue,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    openSection();

    expect(selectors.fieldAppearanceWidthAuto()).toBeInTheDocument();

    fireEvent.click(selectors.fieldAppearanceWidthAuto());

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ...defaultValue,
        width: { auto: true, value: 0 },
      })
    );
  });

  it('Should change width size', () => {
    render(
      getComponent({
        onChange,
        value: defaultValue,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    openSection();

    expect(selectors.fieldAppearanceWidthAuto()).toBeInTheDocument();
    expect(selectors.fieldAppearanceWidthValue()).toBeInTheDocument();

    fireEvent.change(selectors.fieldAppearanceWidthValue(), { target: { value: '150' } });
    fireEvent.blur(selectors.fieldAppearanceWidthValue(), { target: { value: '150' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ...defaultValue,
        width: { auto: false, value: 150 },
      })
    );
  });

  it('Should change width min value', () => {
    const value = createActionsColumnConfig({
      width: {
        auto: true,
        min: 10,
        value: 0,
      },
      label: 'Actions',
      fontSize: undefined,
    });

    render(
      getComponent({
        onChange,
        value: value,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    openSection();

    expect(selectors.fieldAppearanceWidthAuto()).toBeInTheDocument();
    expect(selectors.fieldAppearanceWidthMin()).toBeInTheDocument();

    fireEvent.change(selectors.fieldAppearanceWidthMin(), { target: { value: '5' } });
    fireEvent.blur(selectors.fieldAppearanceWidthMin(), { target: { value: '5' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ...value,
        width: { auto: true, min: 5, value: 0 },
      })
    );
  });

  it('Should change width max value', () => {
    const value = createActionsColumnConfig({
      width: {
        auto: true,
        max: 20,
        value: 0,
      },
      label: 'Actions',
      fontSize: undefined,
    });

    render(
      getComponent({
        onChange,
        value: value,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    openSection();

    expect(selectors.fieldAppearanceWidthAuto()).toBeInTheDocument();
    expect(selectors.fieldAppearanceWidthMax()).toBeInTheDocument();

    fireEvent.change(selectors.fieldAppearanceWidthMax(), { target: { value: '25' } });
    fireEvent.blur(selectors.fieldAppearanceWidthMax(), { target: { value: '25' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ...value,
        width: { auto: true, max: 25, value: 0 },
      })
    );
  });
});
