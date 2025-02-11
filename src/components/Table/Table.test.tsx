import { EventBusSrv } from '@grafana/data';
import { createRow, Table as TableInstance } from '@tanstack/react-table';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React, { useRef } from 'react';

import { ACTIONS_COLUMN_ID, ROW_HIGHLIGHT_STATE_KEY } from '@/constants';
import { ColumnEditorType, ColumnPinDirection, Pagination, ScrollToRowPosition } from '@/types';
import { createColumnAccessorFn, createColumnConfig, createColumnMeta, createRowHighlightConfig } from '@/utils';

import { useAddData } from './hooks';
import { Table, testIds } from './Table';

type Props = React.ComponentProps<typeof Table>;

/**
 * Mock ButtonSelect
 */
jest.mock('../ui/ButtonSelect');

/**
 * Mock Use Add Data
 */
jest.mock('./hooks/useAddData', () => ({
  useAddData: jest.fn(),
}));

describe('Table', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(testIds);
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
   * On After Scroll
   */
  const onAfterScroll = jest.fn();

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <Wrapper
        columns={[]}
        data={[]}
        eventBus={new EventBusSrv()}
        pagination={pagination}
        onAfterScroll={onAfterScroll}
        shouldScroll={{ current: false }}
        {...(props as any)}
      />
    );
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

  beforeEach(() => {
    /**
     * Fix useVirtualizer
     */
    Element.prototype.getBoundingClientRect = jest.fn(function () {
      return getDomRect(500, 500) as any;
    });

    jest.mocked(useAddData).mockReturnValue({} as never);
  });

  it('Should render', async () => {
    await act(async () => render(getComponent({})));

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should render data', async () => {
    await act(async () =>
      render(
        getComponent({
          showHeader: true,
          columns: [
            {
              id: 'device',
              accessorFn: createColumnAccessorFn('device'),
            },
            {
              id: 'comment.info.name',
              accessorFn: createColumnAccessorFn('comment.info.name'),
            },
            {
              id: ACTIONS_COLUMN_ID,
            },
          ],
          data: [
            {
              device: 'device1',
              'comment.info.name': 'comment1',
            },
            {
              device: 'device2',
              'comment.info.name': 'comment2',
            },
          ],
        })
      )
    );

    expect(selectors.root());
    expect(selectors.headerCell(false, 'device')).toBeInTheDocument();
    expect(selectors.headerCell(false, ACTIONS_COLUMN_ID)).toBeInTheDocument();

    expect(selectors.bodyCell(false, '0_device')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '0_device')).toHaveTextContent('device1');
    expect(selectors.bodyCell(false, '0_comment.info.name')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '0_comment.info.name')).toHaveTextContent('comment1');

    expect(selectors.bodyCell(false, '1_device')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '1_device')).toHaveTextContent('device2');
    expect(selectors.bodyCell(false, '1_comment.info.name')).toBeInTheDocument();
    expect(selectors.bodyCell(false, '1_comment.info.name')).toHaveTextContent('comment2');
  });

  it('Should allow to expand grouped cell', async () => {
    await act(async () =>
      render(
        getComponent({
          showHeader: true,
          columns: [
            {
              id: 'device',
              accessorFn: createColumnAccessorFn('device'),
              enableGrouping: true,
            },
            {
              id: 'value',
              accessorFn: createColumnAccessorFn('value'),
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
          showHeader: true,
          columns: [
            {
              id: 'device',
              accessorFn: createColumnAccessorFn('device'),
            },
            {
              id: 'value',
              accessorFn: createColumnAccessorFn('value'),
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
          showHeader: true,
          columns: [
            {
              id: 'device',
              accessorFn: createColumnAccessorFn('device'),
              enablePinning: false,
            },
            {
              id: 'value',
              accessorFn: createColumnAccessorFn('value'),
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
              accessorFn: createColumnAccessorFn('value2'),
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

  it('Should not show header if disabled', async () => {
    await act(async () =>
      render(
        getComponent({
          showHeader: false,
          columns: [
            {
              id: 'device',
              accessorFn: createColumnAccessorFn('device'),
              enablePinning: false,
            },
            {
              id: 'value',
              accessorFn: createColumnAccessorFn('value'),
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
              accessorFn: createColumnAccessorFn('value2'),
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
     * Header cell
     */
    expect(selectors.headerCell(true, 'value')).not.toBeInTheDocument();
    expect(selectors.headerCell(true, 'value2')).not.toBeInTheDocument();
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

  describe('Add row', () => {
    it('Should render new row', async () => {
      jest.mocked(useAddData).mockImplementation(
        ({ table }) =>
          ({
            row: createRow(table, '0', { device: '' }, 0, 0),
          }) as never
      );

      await act(async () =>
        render(
          getComponent({
            showHeader: true,
            columns: [
              {
                id: 'device',
                accessorFn: createColumnAccessorFn('device'),
                meta: createColumnMeta({
                  addRowEditor: {
                    type: ColumnEditorType.STRING,
                  },
                  addRowEditable: true,
                }),
              },
              {
                id: ACTIONS_COLUMN_ID,
              },
            ],
            data: [
              {
                device: 'device1',
              },
            ],
            isAddRowEnabled: true,
          })
        )
      );

      expect(selectors.root());
      expect(selectors.headerCell(false, 'device')).toBeInTheDocument();
      expect(selectors.headerCell(false, ACTIONS_COLUMN_ID)).toBeInTheDocument();

      expect(selectors.newRowContainer()).toBeInTheDocument();
      const newRowSelectors = getSelectors(within(selectors.newRowContainer()));
      expect(newRowSelectors.bodyCell(false, '0_device')).toBeInTheDocument();

      const bodySelectors = getSelectors(within(selectors.body()));
      expect(bodySelectors.bodyCell(false, '0_device')).toBeInTheDocument();
      expect(bodySelectors.bodyCell(false, '0_device')).toHaveTextContent('device1');
    });
  });

  describe('Row Highlight', () => {
    it('Should apply background to highlighted row', async () => {
      await act(async () =>
        render(
          getComponent({
            columns: [
              {
                id: 'device',
                accessorFn: createColumnAccessorFn('device'),
                meta: createColumnMeta({}),
              },
            ],
            data: [
              {
                device: 'device1',
                [ROW_HIGHLIGHT_STATE_KEY]: true,
              },
              {
                device: 'device2',
                [ROW_HIGHLIGHT_STATE_KEY]: false,
              },
            ],
            rowHighlightConfig: createRowHighlightConfig({
              enabled: true,
              backgroundColor: 'red',
            }),
          })
        )
      );

      expect(selectors.root());
      expect(selectors.bodyCell(false, '0_device')).toBeInTheDocument();
      expect(selectors.bodyCell(false, '0_device')).toHaveTextContent('device1');
      expect(selectors.bodyRow(false, '0')).toHaveStyle({
        backgroundColor: 'red',
      });

      expect(selectors.bodyCell(false, '1_device')).toBeInTheDocument();
      expect(selectors.bodyCell(false, '1_device')).toHaveTextContent('device2');
      expect(selectors.bodyRow(false, '1')).not.toHaveStyle({
        backgroundColor: 'red',
      });
    });

    it('Should scroll to first highlighted row', async () => {
      await act(async () =>
        render(
          getComponent({
            columns: [
              {
                id: 'device',
                accessorFn: createColumnAccessorFn('device'),
                meta: createColumnMeta({}),
              },
            ],
            data: [
              {
                device: 'device1',
                [ROW_HIGHLIGHT_STATE_KEY]: false,
              },
              {
                device: 'device2',
                [ROW_HIGHLIGHT_STATE_KEY]: true,
              },
            ],
            rowHighlightConfig: createRowHighlightConfig({
              enabled: true,
              scrollTo: ScrollToRowPosition.START,
            }),
            isFocused: {
              current: false,
            },
          })
        )
      );

      expect(onAfterScroll).toHaveBeenCalled();
    });
  });
});
