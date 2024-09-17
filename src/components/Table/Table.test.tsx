import { EventBusSrv } from '@grafana/data';
import { Table as TableInstance } from '@tanstack/react-table';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React, { useRef } from 'react';

import { ACTIONS_COLUMN_ID, TEST_IDS } from '@/constants';
import { ColumnPinDirection, Pagination } from '@/types';
import { createColumnConfig, createColumnMeta } from '@/utils';

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
    const tableInstance = useRef<TableInstance<unknown>>(null);

    return (
      <div ref={ref} style={{ height: 400 }}>
        <Table scrollableContainerRef={ref} tableInstance={tableInstance} {...(props as any)} />
      </div>
    );
  };

  /**
   * Pagination
   */
  const createPagination = (pagination: Partial<Pagination>): Pagination => ({
    value: { pageIndex: 0, pageSize: 10 },
    isEnabled: false,
    isManual: false,
    onChange: jest.fn(),
    total: 10,
    ...pagination,
  });
  const pagination = createPagination({});

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <Wrapper columns={[]} data={[]} eventBus={new EventBusSrv()} pagination={pagination} {...(props as any)} />;
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

    expect(selectors.root()).toBeInTheDocument();
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
            {
              id: ACTIONS_COLUMN_ID,
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
    expect(selectors.headerCell(false, ACTIONS_COLUMN_ID)).toBeInTheDocument();
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

  it('Should make header and footer cells pinned', async () => {
    await act(async () =>
      render(
        getComponent({
          columns: [
            {
              id: 'device',
              accessorKey: 'device',
              enablePinning: false,
            },
            {
              id: 'value',
              accessorKey: 'value',
              enablePinning: true,
              meta: createColumnMeta({
                config: createColumnConfig({
                  pin: ColumnPinDirection.LEFT,
                }),
                footerEnabled: true,
              }),
              footer: () => '123',
            },
            {
              id: 'value2',
              accessorKey: 'value2',
              enablePinning: true,
              meta: createColumnMeta({
                config: createColumnConfig({
                  pin: ColumnPinDirection.RIGHT,
                }),
                footerEnabled: true,
              }),
              footer: () => '111',
            },
          ],
          data: [
            {
              device: 'device1',
              value: 10,
              value2: 11,
            },
            {
              device: 'device2',
              value: 20,
              value2: 21,
            },
          ],
        })
      )
    );

    /**
     * Left Pinned
     */
    expect(selectors.headerCell(false, 'value')).toBeInTheDocument();
    expect(selectors.headerCell(false, 'value')).toHaveStyle({ position: 'sticky', left: 0 });
    expect(selectors.footerCell(false, 'value')).toBeInTheDocument();
    expect(selectors.footerCell(false, 'value')).toHaveStyle({ position: 'sticky', left: 0 });

    /**
     * Right Pinned
     */
    expect(selectors.headerCell(false, 'value2')).toBeInTheDocument();
    expect(selectors.headerCell(false, 'value2')).toHaveStyle({ position: 'sticky', right: 0 });
    expect(selectors.footerCell(false, 'value2')).toBeInTheDocument();
    expect(selectors.footerCell(false, 'value2')).toHaveStyle({ position: 'sticky', right: 0 });
  });

  it('Should show pagination', async () => {
    const pagination = createPagination({ isEnabled: true, isManual: false });

    await act(async () => render(getComponent({ pagination })));

    expect(selectors.pagination()).toBeInTheDocument();
  });

  it('Should show manual pagination', async () => {
    const pagination = createPagination({ isEnabled: true, isManual: true });

    await act(async () => render(getComponent({ pagination })));

    expect(selectors.pagination()).toBeInTheDocument();
  });

  it('Should allow to change page number', async () => {
    const onChange = jest.fn();
    const pagination = createPagination({
      isEnabled: true,
      isManual: true,
      onChange,
      value: { pageIndex: 0, pageSize: 10 },
      total: 100,
    });

    await act(async () => render(getComponent({ pagination })));

    expect(selectors.fieldPageNumber()).toBeInTheDocument();
    expect(selectors.fieldPageNumber()).toHaveValue('1');

    fireEvent.change(selectors.fieldPageNumber(), { target: { value: '3' } });

    expect(onChange).toHaveBeenCalledWith({
      pageIndex: 2,
      pageSize: 10,
    });
  });

  it('Should allow to change page size and reset page index', async () => {
    const onChange = jest.fn();
    const pagination = createPagination({
      isEnabled: true,
      isManual: true,
      onChange,
      value: { pageIndex: 1, pageSize: 10 },
    });

    await act(async () => render(getComponent({ pagination })));

    expect(selectors.fieldPageSize()).toBeInTheDocument();

    fireEvent.change(selectors.fieldPageSize(), { target: { value: '100' } });

    expect(onChange).toHaveBeenCalledWith({
      pageIndex: 0,
      pageSize: 100,
    });
  });
});
