import { cx } from '@emotion/css';
import { DataFrame, SelectableValue } from '@grafana/data';
import { Button, Icon, IconButton, InlineField, InlineFieldRow, Select, useTheme2 } from '@grafana/ui';
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from '@hello-pangea/dnd';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useMemo, useState } from 'react';

import { TEST_IDS } from '../../constants';
import { ColumnConfig, FieldSource, Group } from '../../types';
import { reorder } from '../../utils';
import { ColumnEditor } from '../ColumnEditor';
import { getStyles } from './ColumnsEditor.styles';

/**
 * Get Item Style
 */
const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
  // marginLeft: index * 4,
  /**
   * styles we need to apply on draggables
   */
  ...draggableStyle,
});

/**
 * Properties
 */
interface Props extends Group {
  /**
   * On Change
   * @param item
   */
  onChange: (item: Group) => void;

  /**
   * Data
   */
  data: DataFrame[];
}

/**
 * Columns Editor
 */
export const ColumnsEditor: React.FC<Props> = ({ items: groups, name, onChange, data }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * States
   */
  const [items, setItems] = useState(groups);
  const [newItem, setNewItem] = useState<(FieldSource & { value: string }) | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /**
   * Change Items
   */
  const onChangeItems = useCallback(
    (items: ColumnConfig[]) => {
      setItems(items);
      onChange({
        name,
        items,
      });
    },
    [name, onChange]
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
   * Available Field Options
   */
  const availableFieldOptions = useMemo(() => {
    const item = items[items.length - 1];

    if (item) {
      const dataFrameIndex = data.findIndex((dataFrame, index) =>
        dataFrame.refId === undefined ? index === item.field.source : dataFrame.refId === item.field.source
      );
      const dataFrame = data[dataFrameIndex];

      if (dataFrame) {
        return (
          dataFrame.fields
            .map(({ name }) => ({
              label: name,
              source: dataFrame.refId ?? dataFrameIndex,
              value: name,
              fieldName: name,
            }))
            .filter((option) => !items.some((item) => item.field.name === option.value)) || []
        );
      }
    }

    return data.reduce((acc: SelectableValue[], dataFrame, index) => {
      return acc.concat(
        dataFrame.fields.map((field) => {
          const source = dataFrame.refId || index;

          return {
            value: `${source}:${field.name}`,
            fieldName: field.name,
            label: `${source}:${field.name}`,
            source,
          };
        })
      );
    }, []);
  }, [data, items]);

  /**
   * Add New Item
   */
  const onAddNewItem = useCallback(() => {
    if (newItem) {
      onChangeItems([
        ...items,
        {
          field: {
            name: newItem.name,
            source: newItem.source,
          },
          label: '',
        },
      ]);
      setNewItem(null);
    }
  }, [items, newItem, onChangeItems]);

  return (
    <div data-testid={TEST_IDS.levelsEditor.root}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={name}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.field.name} draggableId={item.field.name} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      className={styles.item}
                      data-testid={TEST_IDS.levelsEditor.item(item.field.name)}
                    >
                      <Collapse
                        fill="solid"
                        title={
                          <>
                            {item.field.name && (
                              <div className={styles.titleWrapper}>
                                <div className={cx(styles.title)}>{item.field.name}</div>
                              </div>
                            )}
                          </>
                        }
                        actions={
                          <>
                            <IconButton
                              name="trash-alt"
                              onClick={() =>
                                onChangeItems(items.filter((column) => column.field.name !== item.field.name))
                              }
                              aria-label="Remove"
                              data-testid={TEST_IDS.levelsEditor.buttonRemove}
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
                        isOpen={expanded[item.field.name]}
                        onToggle={(isOpen) =>
                          setExpanded({
                            ...expanded,
                            [item.field.name]: isOpen,
                          })
                        }
                      >
                        <ColumnEditor
                          value={item}
                          onChange={(item) => {
                            onChangeItems(
                              items.map((column) => (column.field.name === item.field.name ? item : column))
                            );
                          }}
                          data={data}
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

      <InlineFieldRow data-testid={TEST_IDS.levelsEditor.newItem}>
        <InlineField label="New Column" grow={true}>
          <Select
            options={availableFieldOptions}
            value={newItem?.value || null}
            aria-label={TEST_IDS.levelsEditor.newItemName}
            onChange={(event) => {
              setNewItem({
                value: event.value,
                source: event.source,
                name: event.fieldName,
              });
            }}
          />
        </InlineField>
        <Button
          icon="plus"
          title="Add Level"
          disabled={!newItem}
          onClick={onAddNewItem}
          data-testid={TEST_IDS.levelsEditor.buttonAddNew}
        >
          Add
        </Button>
      </InlineFieldRow>
    </div>
  );
};
