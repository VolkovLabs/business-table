import { createSelector } from '@volkovlabs/jest-selectors';

/**
 * All Constants here
 */

export const TEST_IDS = {
  panel: {
    root: createSelector('data-testid panel'),
    tab: createSelector((name: unknown) => `data-testid panel tab-${name}`),
  },
  groupsEditor: {
    buttonAddNew: createSelector('data-testid fields-editor button-add-new'),
    buttonRemove: createSelector('data-testid fields-editor button-remove'),
    buttonStartRename: createSelector('data-testid fields-editor button-start-rename'),
    buttonCancelRename: createSelector('data-testid fields-editor button-cancel-rename'),
    buttonSaveRename: createSelector('data-testid fields-editor button-save-rename'),
    fieldName: createSelector('data-testid fields-editor field-name'),
    item: createSelector((name: unknown) => `data-testid fields-editor item-${name}`),
    newItem: createSelector('data-testid fields-editor new-level'),
    newItemName: createSelector('data-testid fields-editor new-item-name'),
  },
  columnsEditor: {
    buttonAddNew: createSelector('data-testid columns-editor button-add-new'),
    buttonRemove: createSelector('data-testid columns-editor button-remove'),
    itemHeader: createSelector((name: unknown) => `data-testid columns-editor item-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid columns-editor item-content-${name}`),
    newItem: createSelector('data-testid columns-editor new-item'),
    newItemName: createSelector('data-testid columns-editor new-item-name'),
    root: createSelector('data-testid columns-editor'),
  },
  columnEditor: {
    fieldLabel: createSelector('data-testid column-editor field-label'),
    fieldType: createSelector('data-testid column-editor field-type'),
    fieldGroup: createSelector('data-testid column-editor field-group'),
    fieldAggregation: createSelector('data-testid column-editor field-aggregation'),
    fieldFilterEnabled: createSelector('data-testid column-editor field-filter-enabled'),
    fieldFilterMode: createSelector('data-testid column-editor field-filter-mode'),
    fieldFilterVariable: createSelector('data-testid column-editor field-filter-variable'),
  },
  defaultCellRenderer: {
    root: createSelector('data-testid default-cell-renderer'),
  },
  table: {
    root: createSelector('data-testid table'),
    headerCell: createSelector((name: unknown) => `data-testid table header-cell-${name}`),
    bodyCell: createSelector((name: unknown) => `data-testid table body-cell-${name}`),
    buttonExpandCell: createSelector((name: unknown) => `table button-expand-cell-${name}`),
  },
};

/**
 * All Value Parameter
 */
export const ALL_VALUE_PARAMETER = '$__all';
