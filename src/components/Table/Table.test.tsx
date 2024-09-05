import { EventBusSrv } from '@grafana/data';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React, { useRef } from 'react';

import { TEST_IDS } from '@/constants';
import { createColumnMeta } from '@/utils';

import { Table } from './Table';

type Props = React.ComponentProps<typeof Table>;

describe('Table', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.table);
  const selectors = getSelectors(screen);

  /**
   * Wrapper with ref
   * @param props
   * @constructor
   */
  const Wrapper = (props: Partial<Props>) => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div ref={ref} style={{ height: 400 }}>
        <Table scrollableContainerRef={ref} {...(props as any)} />
      </div>
    );
  };

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <Wrapper columns={[]} data={[]} eventBus={new EventBusSrv()} {...(props as any)} />;
  };

  const getDomRect = (width: number, height: number) => ({
    width,
    height,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
  });

  /**
   * Fix useVirtualizer
   */
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(function () {
      return getDomRect(500, 500) as any;
    });
  });

  it('Should render', async () => {
    await act(async () => render(getComponent({})));

    expect(selectors.root());
  });

  it('Should render data', async () => {
    await act(async () =>
      render(
        getComponent({
          columns: [
            {
              id: 'device',
              accessorKey: 'device',
            },
          ],
          data: [
            {
              device: 'device1',
            },
            {
              device: 'device2',
            },
          ],
        })
      )
    );

    expect(selectors.root());
    expect(selectors.headerCell(false, 'device')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '0_device')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '1_device')).toBeInTheDocument();
  });

  it('Should allow to expand grouped cell', async () => {
    await act(async () =>
      render(
        getComponent({
          columns: [
            {
              id: 'device',
              accessorKey: 'device',
              enableGrouping: true,
            },
            {
              id: 'value',
              accessorKey: 'value',
              aggregationFn: () => null,
            },
          ],
          data: [
            {
              device: 'device1',
              value: 10,
            },
            {
              device: 'device2',
              value: 20,
            },
          ],
        })
      )
    );

    expect(selectors.bodyCell(false, 'device:device1_device')).toBeInTheDocument();
    expect(selectors.buttonExpandCell(false, 'device:device1_device')).toBeInTheDocument();

    /**
     * Check if nested columns collapsed by default
     */

    fireEvent.click(selectors.buttonExpandCell(false, 'device:device1_device'));

    /**
     * Check if nested columns expanded
     */
    expect(selectors.bodyCell(false, 'device:device1_value')).toBeInTheDocument();
  });

  it('Should show footer cell', async () => {
    await act(async () =>
      render(
        getComponent({
          columns: [
            {
              id: 'device',
              accessorKey: 'device',
            },
            {
              id: 'value',
              accessorKey: 'value',
              meta: createColumnMeta({
                footerEnabled: true,
              }),
              footer: () => '123',
            },
          ],
          data: [
            {
              device: 'device1',
              value: 10,
            },
            {
              device: 'device2',
              value: 20,
            },
          ],
        })
      )
    );

    expect(selectors.footerCell(false, 'device')).toBeInTheDocument();
    expect(selectors.footerCell(false, 'value')).toBeInTheDocument();
    expect(selectors.footerCell(false, 'value')).toHaveTextContent('123');
  });
});
