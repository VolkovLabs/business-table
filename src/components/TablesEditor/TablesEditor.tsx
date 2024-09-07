import { cx } from '@emotion/css';
import { StandardEditorProps } from '@grafana/data';
import { Button, Icon, InlineField, InlineFieldRow, Input, useTheme2 } from '@grafana/ui';
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from '@hello-pangea/dnd';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { PanelOptions, TableConfig } from '@/types';
import { reorder } from '@/utils';

import { ColumnsEditor } from '../ColumnsEditor';
import { getStyles } from './TablesEditor.styles';

/**
 * Properties
 */
interface Props extends StandardEditorProps<TableConfig[], null, PanelOptions> {}

/**
 * Get Item Style
 */
const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
  /**
   * styles we need to apply on draggables
   */
  ...draggableStyle,
});

/**
 * Tables Editor
 */
export const TablesEditor: React.FC<Props> = ({ context: { options, data }, onChange }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * States
   */
  const [items, setItems] = useState<TableConfig[]>(options?.tables || []);
  const [newItemName, setNewItemName] = useState('');
  const [collapseState, setCollapseState] = useState<Record<string, boolean>>({});
  const [editItem, setEditItem] = useState('');
  const [editName, setEditName] = useState('');

  /**
  /**
   * Change Items
   */
  const onChangeItems = useCallback(
    (items: TableConfig[]) => {
      setItems(items);
      onChange(items);
    },
    [onChange]
  );

  /**
   * Drag End
   */
  const onDragEnd = useCallback(
    (result: DropResult) => {
      /**
       * Dropped outside the list
       */
      if (!result.destination) {
        return;
      }

      onChangeItems(reorder(items, result.source.index, result.destination.index));
    },
    [items, onChangeItems]
  );

  /**
   * Toggle Item Expanded State
   */
  const onToggleItemExpandedState = useCallback((name: string) => {
    setCollapseState((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }, []);

  /**
   * Add New Item
   */
  const onAddNewItem = useCallback(() => {
    setNewItemName('');
    onChangeItems(items.concat([{ name: newItemName, items: [] }]));
    onToggleItemExpandedState(newItemName);
  }, [items, newItemName, onChangeItems, onToggleItemExpandedState]);

  /**
   * Change Item
   */
  const onChangeItem = useCallback(
    (updatedItem: TableConfig) => {
      onChangeItems(items.map((item) => (item.name === updatedItem.name ? updatedItem : item)));
    },
    [items, onChangeItems]
  );

  /**
   * Is Name Exists error
   */
  const isNameExistsError = useMemo(() => {
    return items.some((item) => item.name === newItemName);
  }, [items, newItemName]);

  /**
   * On Cancel Edit
   */
  const onCancelEdit = useCallback(() => {
    setEditItem('');
    setEditName('');
    setCollapseState((prev) => ({
      ...prev,
      [editItem]: prev[editItem] ? editItem === editName : false,
      [editName]: prev[editItem],
    }));
  }, [editItem, editName]);

  /**
   * Check Updated Name
   */
  const isUpdatedNameValid = useMemo(() => {
    if (!editName.trim()) {
      return false;
    }

    if (editItem !== editName) {
      return !items.some((item) => item.name === editName);
    }
    return true;
  }, [editItem, editName, items]);

  /**
   * On Save Name
   */
  const onSaveName = useCallback(() => {
    onChangeItems(
      items.map((item) =>
        item.name === editItem
          ? {
              ...item,
              name: editName,
            }
          : item
      )
    );
    onCancelEdit();
  }, [items, onChangeItems, onCancelEdit, editItem, editName]);

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tables-editor">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map(({ name, items: levels }, index) => (
                <Draggable key={name} draggableId={name} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      className={styles.item}
                    >
                      <Collapse
                        key={name}
                        title={
                          editItem === name ? (
                            <div
                              className={cx(styles.itemHeader, styles.itemHeaderForm)}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <InlineField className={styles.fieldName} invalid={!isUpdatedNameValid}>
                                <Input
                                  autoFocus={true}
                                  value={editName}
                                  onChange={(event) => setEditName(event.currentTarget.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && isUpdatedNameValid) {
                                      onSaveName();
                                    }

                                    if (e.key === 'Escape') {
                                      onCancelEdit();
                                    }
                                  }}
                                  {...TEST_IDS.tablesEditor.fieldName.apply()}
                                />
                              </InlineField>
                              <Button
                                variant="secondary"
                                fill="text"
                                className={styles.actionButton}
                                icon="times"
                                size="sm"
                                onClick={onCancelEdit}
                                {...TEST_IDS.tablesEditor.buttonCancelRename.apply()}
                              />
                              <Button
                                variant="secondary"
                                fill="text"
                                className={styles.actionButton}
                                icon="save"
                                size="sm"
                                onClick={onSaveName}
                                disabled={!isUpdatedNameValid}
                                tooltip={
                                  isUpdatedNameValid ? '' : 'Name is empty or table with the same name already exists.'
                                }
                                {...TEST_IDS.tablesEditor.buttonSaveRename.apply()}
                              />
                            </div>
                          ) : (
                            <div className={cx(styles.itemHeader, styles.itemHeaderText)}>{name}</div>
                          )
                        }
                        headerTestId={TEST_IDS.tablesEditor.item.selector(name)}
                        actions={
                          <>
                            {editItem !== name && (
                              <Button
                                icon="edit"
                                variant="secondary"
                                fill="text"
                                size="sm"
                                className={styles.actionButton}
                                onClick={() => {
                                  /**
                                   * Start Edit
                                   */
                                  setEditName(name);
                                  setEditItem(name);
                                }}
                                {...TEST_IDS.tablesEditor.buttonStartRename.apply()}
                              />
                            )}
                            <Button
                              icon="trash-alt"
                              variant="secondary"
                              fill="text"
                              size="sm"
                              className={styles.actionButton}
                              onClick={() => {
                                /**
                                 * Remove Item
                                 */
                                onChangeItems(items.filter((item) => item.name !== name));
                              }}
                              {...TEST_IDS.tablesEditor.buttonRemove.apply()}
                            />
                            <div className={styles.dragHandle} {...provided.dragHandleProps}>
                              <Icon name="draggabledots" className={styles.dragIcon} />
                            </div>
                          </>
                        }
                        isOpen={collapseState[name]}
                        onToggle={() => onToggleItemExpandedState(name)}
                      >
                        <>
                          <ColumnsEditor name={name} items={levels} data={data} onChange={onChangeItem} />
                        </>
                      </Collapse>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <InlineFieldRow className={styles.newItem} {...TEST_IDS.tablesEditor.newItem.apply()}>
        <InlineField
          label="New Table"
          grow={true}
          invalid={isNameExistsError}
          error="Table with the same name already exists."
        >
          <Input
            placeholder="Unique name"
            value={newItemName}
            onChange={(event) => setNewItemName(event.currentTarget.value.trim())}
            {...TEST_IDS.tablesEditor.newItemName.apply()}
          />
        </InlineField>
        <Button
          icon="plus"
          title="Add Table"
          disabled={!newItemName || isNameExistsError}
          onClick={onAddNewItem}
          {...TEST_IDS.tablesEditor.buttonAddNew.apply()}
        >
          Add
        </Button>
      </InlineFieldRow>
    </>
  );
};
