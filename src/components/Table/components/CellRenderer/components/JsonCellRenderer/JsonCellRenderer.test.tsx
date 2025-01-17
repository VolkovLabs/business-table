import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createColumnConfig } from '@/utils';

import { JsonCellRenderer } from './JsonCellRenderer';

type Props = React.ComponentProps<typeof JsonCellRenderer>;

describe('PreformattedCellRenderer', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.jsonCellRenderer);
  const selectors = getSelectors(screen);

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <JsonCellRenderer renderValue={jest.fn()} {...(props as any)} />;
  };

  it('Should render value', () => {
    render(
      getComponent({
        value: `{ "name": "Device2" }`,
      })
    );

    expect(selectors.formattedText()).toBeInTheDocument();
    expect(selectors.formattedText()).toHaveTextContent('{ "name": "Device2" }');
    expect(selectors.formattedText()).toHaveStyle('border: 1px solid rgba(204, 204, 220, 0.08)');
  });

  it('Should apply contrast color', () => {
    render(
      getComponent({
        config: createColumnConfig({ showingRows: 20 }),
        value: `{ "name": "Device2" }`,
        bgColor: '#000000',
      })
    );

    expect(selectors.formattedText()).toBeInTheDocument();
    expect(selectors.formattedText()).toHaveTextContent('{ "name": "Device2" }');
    expect(selectors.formattedText()).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('Should apply showingRows to css styles', () => {
    render(
      getComponent({
        config: createColumnConfig({ showingRows: 2 }),
        value: `{ "name": "Device2" }`,
        bgColor: '#000000',
      })
    );
    expect(selectors.formattedText()).toBeInTheDocument();
    expect(selectors.formattedText()).toHaveStyle('max-height: calc(2 * 16px)');
  });

  it('Should show error icon if failure with JSON format', () => {
    render(
      getComponent({
        config: createColumnConfig({ showingRows: 2 }),
        value: `{ "name": "Device2" } }`,
        bgColor: '#000000',
      })
    );

    expect(selectors.error()).toBeInTheDocument();
    expect(selectors.formattedText()).toBeInTheDocument();
  });

  it('Should open drawer and close drawer', async () => {
    render(
      getComponent({
        config: createColumnConfig({ showingRows: 2 }),
        value: `{ "name": "Device2" }`,
        bgColor: '#000000',
      })
    );

    expect(selectors.buttonOpenDrawer()).toBeInTheDocument();
    expect(selectors.formattedText()).toBeInTheDocument();

    await act(() => fireEvent.click(selectors.buttonOpenDrawer()));
    expect(selectors.buttonCloseDrawer()).toBeInTheDocument();

    await act(() => fireEvent.click(selectors.buttonCloseDrawer()));
    expect(selectors.buttonCloseDrawer(true)).not.toBeInTheDocument();
  });

  it('Should render json in drawer', async () => {
    render(
      getComponent({
        config: createColumnConfig({ showingRows: 2 }),
        value: `test`,
        bgColor: '#000000',
      })
    );

    expect(selectors.buttonOpenDrawer()).toBeInTheDocument();
    expect(selectors.formattedText()).toBeInTheDocument();

    await act(() => fireEvent.click(selectors.buttonOpenDrawer()));
    expect(selectors.buttonCloseDrawer()).toBeInTheDocument();

    expect(selectors.codeEditor()).toBeInTheDocument();
    expect(selectors.codeEditor()).toHaveValue(`test`);
  });
});
