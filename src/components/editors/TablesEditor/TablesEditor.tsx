import { cx } from '@emotion/css';
import { StandardEditorProps } from '@grafana/data';
import { Alert, Button, Icon, InlineField, InlineFieldRow, Input, useTheme2 } from '@grafana/ui';
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from '@hello-pangea/dnd';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useMemo, useState } from 'react';

import { DEFAULT_PERMISSION_CONFIG, DEFAULT_REQUEST_CONFIG, PAGE_SIZES, TEST_IDS } from '@/constants';
import { tablesEditorContext } from '@/hooks';
import {
  ColumnAlignment,
  ColumnHeaderFontSize,
  PaginationMode,
  PanelOptions,
  ScrollToRowPosition,
  TableConfig,
} from '@/types';
import { reorder } from '@/utils';

import { TableEditor } from './components';
import { getStyles } from './TablesEditor.styles';

/**
 * Properties
 */
type Props = StandardEditorProps<TableConfig[], null, PanelOptions>;

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
 * Test Ids
 */
const testIds = TEST_IDS.tablesEditor;

/**
 * Tables Editor
 */
export const TablesEditor: React.FC<Props> = ({ context: { options, data }, onChange, value }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * States
   */
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

      onChangeItems(reorder(value, result.source.index, result.destination.index));
    },
    [value, onChangeItems]
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
    onChangeItems(
      value.concat([
        {
          expanded: false,
          name: newItemName,
          showHeader: true,
          items: [],
          update: DEFAULT_REQUEST_CONFIG,
          pagination: { enabled: false, mode: PaginationMode.CLIENT, defaultPageSize: PAGE_SIZES[0] },
          addRow: {
            enabled: false,
            request: DEFAULT_REQUEST_CONFIG,
            permission: DEFAULT_PERMISSION_CONFIG,
          },
          deleteRow: {
            enabled: false,
            request: DEFAULT_REQUEST_CONFIG,
            permission: DEFAULT_PERMISSION_CONFIG,
          },
          actionsColumnConfig: {
            label: '',
            width: {
              auto: false,
              value: 100,
            },
            alignment: ColumnAlignment.START,
            fontSize: ColumnHeaderFontSize.MD,
          },
          rowHighlight: {
            enabled: false,
            columnId: '',
            variable: '',
            backgroundColor: 'transparent',
            scrollTo: ScrollToRowPosition.NONE,
          },
        },
      ])
    );
    onToggleItemExpandedState(newItemName);
  }, [value, newItemName, onChangeItems, onToggleItemExpandedState]);

  /**
   * Change Item
   */
  const onChangeItem = useCallback(
    (updatedItem: TableConfig) => {
      onChangeItems(value.map((item) => (item.name === updatedItem.name ? updatedItem : item)));
    },
    [value, onChangeItems]
  );

  /**
   * Is Name Exists error
   */
  const isNameExistsError = useMemo(() => {
    return value.some((item) => item.name === newItemName);
  }, [value, newItemName]);

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
      return !value.some((item) => item.name === editName);
    }
    return true;
  }, [editItem, editName, value]);

  /**
   * On Save Name
   */
  const onSaveName = useCallback(() => {
    onChangeItems(
      value.map((item) =>
        item.name === editItem
          ? {
              ...item,
              name: editName,
            }
          : item
      )
    );
    onCancelEdit();
  }, [value, onChangeItems, onCancelEdit, editItem, editName]);

  return (
    <tablesEditorContext.Provider value={{ nestedObjects: options?.nestedObjects || [] }}>
      {value.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tables-editor">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {value.map((item, index) => (
                  <Draggable key={item.name} draggableId={item.name} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        className={styles.item}
                        {...testIds.item.apply(item.name)}
                      >
                        <Collapse
                          key={item.name}
                          title={
                            editItem === item.name ? (
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
                                    {...testIds.fieldName.apply()}
                                  />
                                </InlineField>
                                <Button
                                  variant="secondary"
                                  fill="text"
                                  className={styles.actionButton}
                                  icon="times"
                                  size="sm"
                                  onClick={onCancelEdit}
                                  {...testIds.buttonCancelRename.apply()}
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
                                    isUpdatedNameValid
                                      ? ''
                                      : 'Name is empty or table with the same name already exists.'
                                  }
                                  {...testIds.buttonSaveRename.apply()}
                                />
                              </div>
                            ) : (
                              <div className={cx(styles.itemHeader, styles.itemHeaderText)}>{item.name}</div>
                            )
                          }
                          headerTestId={testIds.itemHeader.selector(item.name)}
                          contentTestId={testIds.itemContent.selector(item.name)}
                          actions={
                            <>
                              {editItem !== item.name && (
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
                                    setEditName(item.name);
                                    setEditItem(item.name);
                                  }}
                                  {...testIds.buttonStartRename.apply()}
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
                                  onChangeItems(value.filter((column) => column.name !== item.name));
                                }}
                                {...testIds.buttonRemove.apply()}
                              />
                              <div className={styles.dragHandle} {...provided.dragHandleProps}>
                                <Icon name="draggabledots" className={styles.dragIcon} />
                              </div>
                            </>
                          }
                          isOpen={collapseState[item.name]}
                          onToggle={() => onToggleItemExpandedState(item.name)}
                        >
                          <TableEditor value={item} onChange={onChangeItem} data={data} />
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
      ) : (
        <Alert severity="info" title="No Tables" {...testIds.noItemsMessage.apply()}>
          Please add at least one table to proceed.
        </Alert>
      )}

      <InlineFieldRow className={styles.newItem} {...testIds.newItem.apply()}>
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
            {...testIds.newItemName.apply()}
          />
        </InlineField>
        <Button
          icon="plus"
          title="Add Table"
          disabled={!newItemName || isNameExistsError}
          onClick={onAddNewItem}
          {...testIds.buttonAddNew.apply()}
        >
          Add
        </Button>
      </InlineFieldRow>
    </tablesEditorContext.Provider>
  );
};
