/**
 * All Constants here
 */

export const TEST_IDS = {
  panel: {
    root: 'data-testid panel',
  },
  groupsEditor: {
    buttonAddNew: 'data-testid fields-editor button-add-new',
    buttonRemove: 'data-testid fields-editor button-remove',
    buttonStartRename: 'data-testid fields-editor button-start-rename',
    buttonCancelRename: 'data-testid fields-editor button-cancel-rename',
    buttonSaveRename: 'data-testid fields-editor button-save-rename',
    fieldName: 'data-testid fields-editor field-name',
    item: (name: string) => `data-testid fields-editor item-${name}`,
    newItem: 'data-testid fields-editor new-level',
    newItemName: 'data-testid fields-editor new-item-name',
  },
  levelsEditor: {
    buttonAddNew: 'data-testid levels-editor button-add-new',
    buttonRemove: 'data-testid levels-editor button-remove',
    item: (name: string) => `data-testid levels-editor item-${name}`,
    newItem: 'data-testid levels-editor new-item',
    newItemName: 'data-testidd levels-editor new-item-name',
    root: 'data-testid levels-editor',
  },
};
