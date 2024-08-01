import { toDataFrame } from '@grafana/data';
import { Select } from '@grafana/ui';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { CellAggregation, CellType, ColumnConfig } from '../../types';
import { ColumnsEditor } from './ColumnsEditor';

/**
 * Mock react-beautiful-dnd
 */
jest.mock('@hello-pangea/dnd', () => ({
  ...jest.requireActual('@hello-pangea/dnd'),
  DragDropContext: jest.fn(({ children }) => children),
  Droppable: jest.fn(({ children }) => children({})),
  Draggable: jest.fn(({ children }) =>
    children(
      {
        draggableProps: {},
      },
      {}
    )
  ),
}));

/**
 * Props
 */
type Props = React.ComponentProps<typeof ColumnsEditor>;

describe('ColumnsEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.columnsEditor);
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   * @param props
   */
  const getComponent = (props: Partial<Props>) => <ColumnsEditor name="Default" {...(props as any)} />;

  /**
   * Create Item
   */
  const createItem = (item: Partial<ColumnConfig>): ColumnConfig => ({
    field: {
      name: 'field',
      source: 'A',
    },
    label: '',
    type: CellType.AUTO,
    group: false,
    aggregation: CellAggregation.NONE,
    ...item,
  });

  /**
   * Data Frame A
   */
  const dataFrameA = toDataFrame({
    fields: [
      {
        name: 'field1',
      },
      {
        name: 'field2',
      },
    ],
    refId: 'A',
  });

  /**
   * Data Frame B
   */
  const dataFrameB = toDataFrame({
    fields: [
      {
        name: 'fieldB1',
      },
      {
        name: 'fieldB2',
      },
    ],
    refId: 'B',
  });

  beforeEach(() => {
    jest.mocked(Select).mockClear();
  });

  it('Should render items', () => {
    render(
      getComponent({
        data: [dataFrameA],
        items: [
          createItem({
            field: { name: 'field1', source: 'A' },
          }),
          createItem({
            field: { name: 'field2', source: 'A' },
          }),
        ],
      })
    );

    expect(selectors.item(false, 'field1')).toBeInTheDocument();
    expect(selectors.item(false, 'field2')).toBeInTheDocument();
  });

  it('Should allow select any fields', () => {
    render(
      getComponent({
        data: [dataFrameA, dataFrameB],
        items: [],
      })
    );

    expect(Select).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          {
            value: 'A:field1',
            source: 'A',
            fieldName: 'field1',
            label: 'A:field1',
          },
          {
            value: 'A:field2',
            source: 'A',
            fieldName: 'field2',
            label: 'A:field2',
          },
          {
            value: 'B:fieldB1',
            source: 'B',
            fieldName: 'fieldB1',
            label: 'B:fieldB1',
          },
          {
            value: 'B:fieldB2',
            source: 'B',
            fieldName: 'fieldB2',
            label: 'B:fieldB2',
          },
        ],
      }),
      expect.anything()
    );
  });

  it('Should allow select any fields from frames without id', () => {
    render(
      getComponent({
        data: [
          {
            fields: dataFrameA.fields,
            length: dataFrameA.length,
          },
          {
            fields: dataFrameB.fields,
            length: dataFrameB.length,
          },
        ],
        items: [],
      })
    );

    expect(Select).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          {
            value: '0:field1',
            source: 0,
            fieldName: 'field1',
            label: '0:field1',
          },
          {
            value: '0:field2',
            source: 0,
            fieldName: 'field2',
            label: '0:field2',
          },
          {
            value: '1:fieldB1',
            source: 1,
            fieldName: 'fieldB1',
            label: '1:fieldB1',
          },
          {
            value: '1:fieldB2',
            source: 1,
            fieldName: 'fieldB2',
            label: '1:fieldB2',
          },
        ],
      }),
      expect.anything()
    );
  });

  it('Should allow select fields only from the current data frame', () => {
    render(
      getComponent({
        data: [dataFrameA, dataFrameB],
        items: [
          createItem({
            field: { name: 'field1', source: 'A' },
          }),
        ],
      })
    );

    expect(Select).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          {
            value: 'field2',
            source: 'A',
            fieldName: 'field2',
            label: 'field2',
          },
        ],
      }),
      expect.anything()
    );
  });

  it('Should allow select fields only from the current data frame without id', () => {
    render(
      getComponent({
        data: [
          {
            fields: dataFrameA.fields,
            length: dataFrameA.length,
          },
          {
            fields: dataFrameB.fields,
            length: dataFrameB.length,
          },
        ],
        items: [
          createItem({
            field: { name: 'field1', source: 0 },
          }),
        ],
      })
    );

    expect(Select).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          {
            value: 'field2',
            source: 0,
            fieldName: 'field2',
            label: 'field2',
          },
        ],
      }),
      expect.anything()
    );
  });

  it('Should add new item', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        data: [dataFrameA, dataFrameB],
        name: 'Group 1',
        items: [
          createItem({
            field: { name: 'field1', source: 'A' },
          }),
        ],
        onChange,
      })
    );

    await act(() => fireEvent.change(selectors.newItemName(), { target: { value: 'field2' } }));

    expect(selectors.buttonAddNew()).toBeInTheDocument();
    expect(selectors.buttonAddNew()).not.toBeDisabled();

    await act(() => fireEvent.click(selectors.buttonAddNew()));

    expect(onChange).toHaveBeenCalledWith({
      name: 'Group 1',
      items: [
        createItem({ field: { name: 'field1', source: 'A' } }),
        createItem({ field: { name: 'field2', source: 'A' } }),
      ],
    });
  });

  it('Should remove item', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        data: [dataFrameA, dataFrameB],
        name: 'Group 1',
        items: [
          createItem({
            field: { name: 'field2', source: 'A' },
          }),
          createItem({
            field: { name: 'field1', source: 'A' },
          }),
        ],
        onChange,
      })
    );

    const field2 = selectors.item(false, 'field2');

    /**
     * Check field presence
     */
    expect(field2).toBeInTheDocument();

    /**
     * Remove
     */
    await act(() => fireEvent.click(getSelectors(within(field2)).buttonRemove()));

    expect(onChange).toHaveBeenCalledWith({
      name: 'Group 1',
      items: [createItem({ field: { name: 'field1', source: 'A' } })],
    });
  });

  it('Should render without errors if dataFrame was removed', () => {
    render(
      getComponent({
        data: [dataFrameB],
        name: 'Group 1',
        items: [
          createItem({
            field: { name: 'field1', source: 'A' },
          }),
        ],
      })
    );

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should reorder items', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};
    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });
    const onChange = jest.fn();

    render(
      getComponent({
        data: [dataFrameA, dataFrameB],
        name: 'Group 1',
        items: [
          createItem({
            field: { name: 'field2', source: 'A' },
          }),
          createItem({
            field: { name: 'field1', source: 'A' },
          }),
        ],
        onChange,
      })
    );

    /**
     * Simulate drop field 1 to index 0
     */
    act(() =>
      onDragEndHandler({
        destination: {
          index: 0,
        },
        source: {
          index: 1,
        },
      } as any)
    );

    expect(onChange).toHaveBeenCalledWith({
      name: 'Group 1',
      items: [
        createItem({ field: { name: 'field1', source: 'A' } }),
        createItem({ field: { name: 'field2', source: 'A' } }),
      ],
    });
  });

  it('Should not reorder items if drop outside the list', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};
    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });
    const onChange = jest.fn();

    render(
      getComponent({
        data: [dataFrameA, dataFrameB],
        name: 'Group 1',
        items: [
          createItem({
            field: { name: 'field2', source: 'A' },
          }),
          createItem({
            field: { name: 'field1', source: 'A' },
          }),
        ],
        onChange,
      })
    );

    /**
     * Simulate drop field 1 to outside the list
     */
    act(() =>
      onDragEndHandler({
        destination: null,
        source: {
          index: 1,
        },
      } as any)
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});
