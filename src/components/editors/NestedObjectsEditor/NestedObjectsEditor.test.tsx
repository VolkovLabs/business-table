import { toDataFrame } from '@grafana/data';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createNestedObjectConfig } from '@/utils';

import { NestedObjectEditor } from './components';
import { NestedObjectsEditor } from './NestedObjectsEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof NestedObjectsEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  itemEditor: createSelector('data-testid item-editor'),
  buttonLevelsUpdate: createSelector('data-testid button-levels-update'),
};

/**
 * Mock Nested Object Editor
 */
const NestedObjectEditorMock = () => <div {...inTestIds.itemEditor.apply()} />;

jest.mock('./components', () => ({
  NestedObjectEditor: jest.fn(),
}));

describe('NestedObjectsEditor', () => {
  /**
   * Get Tested Component
   * @param props
   */
  const getComponent = (props: Partial<Props>) => <NestedObjectsEditor value={[]} {...(props as any)} />;

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

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.nestedObjectsEditor,
    ...inTestIds,
  });
  const selectors = getSelectors(screen);

  beforeEach(() => {
    jest.mocked(NestedObjectEditor).mockImplementation(NestedObjectEditorMock);
  });

  it('Should render items', () => {
    render(
      getComponent({
        context: {
          data: [dataFrameA],
        } as any,
        value: [createNestedObjectConfig({ name: 'group1' }), createNestedObjectConfig({ name: 'group2' })],
      })
    );

    expect(selectors.itemHeader(false, 'group1')).toBeInTheDocument();
    expect(selectors.itemHeader(false, 'group2')).toBeInTheDocument();

    expect(selectors.noItemsMessage(true)).not.toBeInTheDocument();
  });

  it('Should render if tables unspecified', () => {
    render(
      getComponent({
        context: {
          data: [dataFrameA],
          options: {} as any,
        } as any,
      })
    );

    expect(selectors.newItem()).toBeInTheDocument();
    expect(selectors.noItemsMessage()).toBeInTheDocument();
  });

  it('Should add new group', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
        } as any,
        onChange,
        value: [
          createNestedObjectConfig({
            name: 'group1',
          }),
        ],
      })
    );

    await act(() => fireEvent.change(selectors.newItemName(), { target: { value: 'group2' } }));

    expect(selectors.buttonAddNew()).toBeInTheDocument();
    expect(selectors.buttonAddNew()).not.toBeDisabled();

    await act(() => fireEvent.click(selectors.buttonAddNew()));

    expect(onChange).toHaveBeenCalledWith([
      createNestedObjectConfig({ name: 'group1' }),
      expect.objectContaining({
        name: 'group2',
      }),
    ]);
  });

  it('Should remove group', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
        } as any,
        onChange,
        value: [
          createNestedObjectConfig({
            name: 'group2',
          }),
        ],
      })
    );

    const item2 = selectors.itemHeader(false, 'group2');
    const item2Selectors = getSelectors(within(item2));

    /**
     * Check field presence
     */
    expect(item2).toBeInTheDocument();

    /**
     * Remove
     */
    await act(() => fireEvent.click(item2Selectors.buttonRemove()));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  describe('Rename', () => {
    it('Should save new group name', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
          } as any,
          onChange,
          value: [
            createNestedObjectConfig({
              name: 'group1',
            }),
            createNestedObjectConfig({
              name: 'group2',
            }),
          ],
        })
      );

      const item1 = selectors.itemHeader(false, 'group1');
      const item1Selectors = getSelectors(within(item1));
      const item2 = selectors.itemHeader(false, 'group2');
      const item2Selectors = getSelectors(within(item2));

      /**
       * Check item presence
       */
      expect(item2).toBeInTheDocument();

      /**
       * Check rename is not started
       */
      expect(item1Selectors.fieldName(true)).not.toBeInTheDocument();
      expect(item2Selectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(item2Selectors.buttonStartRename()));

      /**
       * Check rename is started only for item2
       */
      expect(item1Selectors.fieldName(true)).not.toBeInTheDocument();
      expect(item2Selectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(item2Selectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Save Name
       */
      expect(item2Selectors.buttonSaveRename()).not.toBeDisabled();
      fireEvent.click(item2Selectors.buttonSaveRename());

      /**
       * Check if saved
       */
      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'group1' }),
        expect.objectContaining({ name: 'hello' }),
      ]);
    });

    it('Should cancel renaming', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
          } as any,
          onChange,
          value: [
            createNestedObjectConfig({
              name: 'group1',
            }),
            createNestedObjectConfig({
              name: 'group2',
            }),
          ],
        })
      );

      const item = selectors.itemHeader(false, 'group2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Cancel Renaming
       */
      expect(itemSelectors.buttonCancelRename()).not.toBeDisabled();
      fireEvent.click(itemSelectors.buttonCancelRename());

      /**
       * Check if renaming canceled
       */
      expect(itemSelectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Check if not saved
       */
      expect(onChange).not.toHaveBeenCalled();
    });

    it('Should not allow to save invalid name', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
          } as any,
          onChange,
          value: [
            createNestedObjectConfig({
              name: 'group1',
            }),
            createNestedObjectConfig({
              name: 'group2',
            }),
          ],
        })
      );

      const item = selectors.itemHeader(false, 'group2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'group1' } });

      /**
       * Check if unable to save
       */
      expect(itemSelectors.buttonSaveRename()).toBeDisabled();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: '' } });

      /**
       * Check if unable to save
       */
      expect(itemSelectors.buttonSaveRename()).toBeDisabled();
    });

    it('Should save name by enter', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
          } as any,
          onChange,
          value: [createNestedObjectConfig({ name: 'group1' }), createNestedObjectConfig({ name: 'group2' })],
        })
      );

      const item = selectors.itemHeader(false, 'group2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Press Enter
       */
      await act(async () => fireEvent.keyDown(selectors.fieldName(), { key: 'Enter' }));

      /**
       * Check if saved
       */
      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'group1' }),
        expect.objectContaining({ name: 'hello' }),
      ]);
    });

    it('Should cancel renaming by escape', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
          } as any,
          onChange,
          value: [createNestedObjectConfig({ name: 'group1' }), createNestedObjectConfig({ name: 'group2' })],
        })
      );

      const item = selectors.itemHeader(false, 'group2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Press Escape
       */
      await act(async () => fireEvent.keyDown(selectors.fieldName(), { key: 'Escape' }));

      /**
       * Check if renaming canceled
       */
      expect(itemSelectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Check if not saved
       */
      expect(onChange).not.toHaveBeenCalled();
    });

    it('Should keep toggled state after save', async () => {
      let value = [createNestedObjectConfig({ name: 'group1' }), createNestedObjectConfig({ name: 'group2' })];
      const onChange = jest.fn((updated) => (value = updated));

      const { rerender } = render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
          } as any,
          onChange,
          value,
        })
      );

      const item = selectors.itemHeader(false, 'group2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Expand Item
       */
      fireEvent.click(item);

      /**
       * Check if item expanded
       */
      expect(selectors.itemEditor()).toBeInTheDocument();

      /**
       * Check rename is not started
       */
      expect(itemSelectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Save Name
       */
      expect(itemSelectors.buttonSaveRename()).not.toBeDisabled();
      fireEvent.click(itemSelectors.buttonSaveRename());

      /**
       * Check if saved
       */
      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'group1' }),
        expect.objectContaining({ name: 'hello' }),
      ]);

      /**
       * Rerender
       */
      rerender(
        getComponent({
          context: {} as any,
          value,
        })
      );

      /**
       * Check if item still expanded
       */
      expect(selectors.itemEditor()).toBeInTheDocument();
    });
  });

  it('Should show group content', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
        } as any,
        onChange,
        value: [createNestedObjectConfig({ name: 'group1' }), createNestedObjectConfig({ name: 'group2' })],
      })
    );

    const item1 = selectors.itemHeader(false, 'group1');

    /**
     * Check field presence
     */
    expect(item1).toBeInTheDocument();

    /**
     * Open
     */
    await act(() => fireEvent.click(item1));

    expect(selectors.itemEditor()).toBeInTheDocument();
  });

  it('Should update item', () => {
    const onChange = jest.fn();

    jest.mocked(NestedObjectEditor).mockImplementation(({ value, onChange }) => (
      <div {...inTestIds.itemEditor.apply()}>
        <button
          {...inTestIds.buttonLevelsUpdate.apply()}
          onClick={() => {
            onChange(createNestedObjectConfig({ name: value.name }));
          }}
        />
      </div>
    ));

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
        } as any,
        onChange,
        value: [
          createNestedObjectConfig({ name: 'group1' }),
          createNestedObjectConfig({
            name: 'group2',
          }),
        ],
      })
    );

    /**
     * Open group1
     */
    fireEvent.click(selectors.itemHeader(false, 'group1'));
    expect(selectors.itemContent(false, 'group1')).toBeInTheDocument();

    /**
     * Simulate group change
     */
    fireEvent.click(selectors.buttonLevelsUpdate());

    expect(onChange).toHaveBeenCalledWith([
      createNestedObjectConfig({
        name: 'group1',
      }),
      createNestedObjectConfig({
        name: 'group2',
      }),
    ]);
  });
});
