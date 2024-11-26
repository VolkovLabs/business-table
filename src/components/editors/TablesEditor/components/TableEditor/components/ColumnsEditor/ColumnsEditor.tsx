import { DataFrame } from '@grafana/data';
import { Button, Icon, IconButton, InlineField, InlineFieldRow, Tag, useTheme2 } from '@grafana/ui';
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from '@hello-pangea/dnd';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useMemo, useState } from 'react';

import { CollapseTitle, FieldPicker } from '@/components';
import { DEFAULT_COLUMN_APPEARANCE, DEFAULT_COLUMN_EDIT, TEST_IDS } from '@/constants';
import {
  CellAggregation,
  CellType,
  ColumnConfig,
  ColumnFilterMode,
  ColumnPinDirection,
  EditorProps,
  FieldSource,
  ImageScale,
} from '@/types';
import { getFieldKey, reorder } from '@/utils';

import { getStyles } from './ColumnsEditor.styles';
import { ColumnEditor } from './components';

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
 * Properties
 */
interface Props extends EditorProps<ColumnConfig[]> {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Data
   */
  data: DataFrame[];

  /**
   * Show header
   *
   * @type {boolean}
   */
  showTableHeader: boolean;
}

/**
 * Test Ids
 */
const testIds = TEST_IDS.columnsEditor;

/**
 * Columns Editor
 */
export const ColumnsEditor: React.FC<Props> = ({ value: items, name, onChange, data, showTableHeader }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * States
   */
  const [newItem, setNewItem] = useState<FieldSource | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /**
   * Change Items
   */
  const onChangeItems = useCallback(
    (items: ColumnConfig[]) => {
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
   * Add New Item
   */
  const onAddNewItem = useCallback(() => {
    if (newItem) {
      onChangeItems([
        ...items,
        {
          enabled: true,
          field: {
            name: newItem.name,
            source: newItem.source,
          },
          label: '',
          type: CellType.AUTO,
          group: false,
          scale: ImageScale.AUTO,
          aggregation: CellAggregation.NONE,
          filter: {
            enabled: false,
            mode: ColumnFilterMode.CLIENT,
            variable: '',
          },
          sort: {
            descFirst: false,
            enabled: false,
          },
          appearance: DEFAULT_COLUMN_APPEARANCE,
          footer: [],
          edit: DEFAULT_COLUMN_EDIT,
          pin: ColumnPinDirection.NONE,
          objectId: '',
        },
      ]);
      setNewItem(null);
    }
  }, [items, newItem, onChangeItems]);

  /**
   * Is Aggregation Available
   */
  const isAggregationAvailable = useMemo(() => {
    return items.some((item) => item.group);
  }, [items]);

  /**
   * Already Selected Fields
   */
  const alreadySelectedFields = useMemo(() => {
    return items.map((item) => item.field);
  }, [items]);

  return (
    <div {...testIds.root.apply()}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={name}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={getFieldKey(item.field)} draggableId={getFieldKey(item.field)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      className={styles.item}
                    >
                      <Collapse
                        headerTestId={testIds.itemHeader.selector(getFieldKey(item.field))}
                        contentTestId={testIds.itemContent.selector(getFieldKey(item.field))}
                        fill="solid"
                        title={
                          <CollapseTitle>
                            {item.field.name}
                            {item.group && <Tag name="Group" />}
                            {item.edit.enabled && <Tag name="Editable" />}
                            {item.pin === ColumnPinDirection.LEFT && <Tag name="Pinned: Left" />}
                            {item.pin === ColumnPinDirection.RIGHT && <Tag name="Pinned: Right" />}
                            {item.filter.enabled && <Tag name="Filterable" />}
                            {item.sort.enabled && <Tag name="Sortable" />}
                          </CollapseTitle>
                        }
                        actions={
                          <>
                            <IconButton
                              name={item.enabled ? 'eye' : 'eye-slash'}
                              aria-label={item.enabled ? 'Hide' : 'Show'}
                              onClick={() => {
                                onChangeItems(
                                  items.map((column) =>
                                    getFieldKey(column.field) === getFieldKey(item.field)
                                      ? {
                                          ...item,
                                          enabled: !item.enabled,
                                        }
                                      : column
                                  )
                                );
                              }}
                              tooltip={item.enabled ? 'Hide' : 'Show'}
                              {...testIds.buttonToggleVisibility.apply()}
                            />
                            <IconButton
                              name="trash-alt"
                              onClick={() =>
                                onChangeItems(
                                  items.filter((column) => getFieldKey(column.field) !== getFieldKey(item.field))
                                )
                              }
                              aria-label="Remove"
                              {...testIds.buttonRemove.apply()}
                            />
                            <div className={styles.dragHandle} {...provided.dragHandleProps}>
                              <Icon
                                title="Drag and drop to reorder"
                                name="draggabledots"
                                size="lg"
                                className={styles.dragIcon}
                              />
                            </div>
                          </>
                        }
                        isOpen={expanded[getFieldKey(item.field)]}
                        onToggle={(isOpen) =>
                          setExpanded({
                            ...expanded,
                            [getFieldKey(item.field)]: isOpen,
                          })
                        }
                      >
                        <ColumnEditor
                          showTableHeader={showTableHeader}
                          value={item}
                          onChange={(item) => {
                            onChangeItems(
                              items.map((column) =>
                                getFieldKey(column.field) === getFieldKey(item.field) ? item : column
                              )
                            );
                          }}
                          data={data}
                          isAggregationAvailable={isAggregationAvailable}
                        />
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

      <InlineFieldRow {...testIds.newItem.apply()}>
        <InlineField htmlFor="config-new-column" label="New Column" grow={true}>
          <FieldPicker
            value={newItem ? newItem : undefined}
            onChange={(field) => {
              setNewItem(field ?? null);
            }}
            data={data}
            alreadySelectedFields={alreadySelectedFields}
            {...testIds.newItemName.apply()}
          />
        </InlineField>
        <Button
          icon="plus"
          title="Add Column"
          disabled={!newItem}
          onClick={onAddNewItem}
          {...testIds.buttonAddNew.apply()}
        >
          Add
        </Button>
      </InlineFieldRow>
    </div>
  );
};
