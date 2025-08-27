import { cx } from '@emotion/css';
import { StandardEditorProps } from '@grafana/data';
import { Alert, Button, InlineField, InlineFieldRow, Input, useTheme2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { TEST_IDS } from '@/constants';
import { nestedObjectsEditorContext } from '@/hooks';
import { NestedObjectConfig, NestedObjectType, PanelOptions } from '@/types';
import { getNestedObjectEditorConfig } from '@/utils';

import { NestedObjectEditor } from './components';
import { getStyles } from './NestedObjectsEditor.styles';

/**
 * Properties
 */
type Props = StandardEditorProps<NestedObjectConfig[], null, PanelOptions>;

/**
 * Test Ids
 */
const testIds = TEST_IDS.nestedObjectsEditor;

/**
 * Nested Objects Editor
 */
export const NestedObjectsEditor: React.FC<Props> = ({ context: { data }, value, onChange }) => {
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
    (items: NestedObjectConfig[]) => {
      onChange(items);
    },
    [onChange]
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
          id: uuidv4(),
          name: newItemName,
          type: NestedObjectType.CARDS,
          get: {
            datasource: '',
            payload: {},
          },
          editor: getNestedObjectEditorConfig(NestedObjectType.CARDS),
          transformHelper: '',
        },
      ])
    );
    onToggleItemExpandedState(newItemName);
  }, [value, newItemName, onChangeItems, onToggleItemExpandedState]);

  /**
   * Change Item
   */
  const onChangeItem = useCallback(
    (updatedItem: NestedObjectConfig) => {
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
    <nestedObjectsEditorContext.Provider value={{ data }}>
      {value.length > 0 ? (
        <div>
          {value.map((item) => (
            <div key={item.name} className={styles.item}>
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
                        tooltip={isUpdatedNameValid ? '' : 'Name is empty or table with the same name already exists.'}
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
                  </>
                }
                isOpen={collapseState[item.name]}
                onToggle={() => onToggleItemExpandedState(item.name)}
              >
                <NestedObjectEditor value={item} onChange={onChangeItem} />
              </Collapse>
            </div>
          ))}
        </div>
      ) : (
        <Alert severity="info" title="No Objects" {...testIds.noItemsMessage.apply()}></Alert>
      )}

      <InlineFieldRow className={styles.newItem} {...testIds.newItem.apply()}>
        <InlineField
          label="New Object"
          grow={true}
          invalid={isNameExistsError}
          error="Object with the same name already exists."
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
          title="Add Object"
          disabled={!newItemName || isNameExistsError}
          onClick={onAddNewItem}
          {...testIds.buttonAddNew.apply()}
        >
          Add
        </Button>
      </InlineFieldRow>
    </nestedObjectsEditorContext.Provider>
  );
};
