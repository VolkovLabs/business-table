import { createSelector } from '@volkovlabs/jest-selectors';

/**
 * All Constants here
 */

export const TEST_IDS = {
  panel: {
    root: createSelector('data-testid panel'),
    tab: createSelector((name: unknown) => `data-testid panel tab-${name}`),
  },
  tablesEditor: {
    buttonAddNew: createSelector('data-testid tables-editor button-add-new'),
    buttonRemove: createSelector('data-testid tables-editor button-remove'),
    buttonStartRename: createSelector('data-testid tables-editor button-start-rename'),
    buttonCancelRename: createSelector('data-testid tables-editor button-cancel-rename'),
    buttonSaveRename: createSelector('data-testid tables-editor button-save-rename'),
    fieldName: createSelector('data-testid tables-editor field-name'),
    item: createSelector((name: unknown) => `data-testid tables-editor item-${name}`),
    newItem: createSelector('data-testid tables-editor new-level'),
    newItemName: createSelector('data-testid tables-editor new-item-name'),
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
    fieldSortEnabled: createSelector('data-testid column-editor field-sort-enabled'),
    fieldAppearanceBackgroundApplyToRow: createSelector(
      'data-testid column-editor field-appearance-background-apply-to-row'
    ),
    fieldAppearanceWidthAuto: createSelector('data-testid column-editor field-appearance-width-auto'),
    fieldAppearanceWidthMin: createSelector('data-testid column-editor field-appearance-width-min'),
    fieldAppearanceWidthMax: createSelector('data-testid column-editor field-appearance-width-max'),
    fieldAppearanceWidthValue: createSelector('data-testid column-editor field-appearance-width-value'),
  },
  defaultCellRenderer: {
    root: createSelector('data-testid default-cell-renderer'),
  },
  table: {
    root: createSelector('data-testid table'),
    headerCell: createSelector((name: unknown) => `data-testid table header-cell-${name}`),
    bodyRow: createSelector((name: unknown) => `data-testid table body-row-${name}`),
    bodyCell: createSelector((name: unknown) => `data-testid table body-cell-${name}`),
    buttonExpandCell: createSelector((name: unknown) => `table button-expand-cell-${name}`),
  },
  filterFacetedList: {
    root: createSelector('data-testid filter-faceted-list'),
    allOption: createSelector('data-testid filter-faceted-list all-option'),
    option: createSelector((name: unknown) => `data-testid filter-faceted-list option-${name}`),
  },
  filterSearch: {
    root: createSelector('data-testid filter-search'),
    buttonMatchCase: createSelector('data-testid filter-search button-match-case'),
  },
  filterNumber: {
    fieldValue: createSelector('data-testid filter-number field-value'),
    fieldOperator: createSelector('data-testid filter-number field-operator'),
    fieldAdditionalValue: createSelector('data-testid filter-number field-additional-value'),
  },
  filterTime: {
    root: createSelector('data-testid filter-time'),
  },
  filterPopup: {
    root: createSelector('data-testid filter-popup'),
    typeOption: createSelector((name: unknown) => `filter-popup type-option-${name}`),
    buttonClear: createSelector('data-testid filter-popup button-clear'),
    buttonCancel: createSelector('data-testid filter-popup button-cancel'),
    buttonSave: createSelector('data-testid filter-popup button-sae'),
  },
  tableHeaderCellFilter: {
    root: createSelector('data-testid table-header-cell-filter'),
  },
};

/**
 * All Value Parameter
 */
export const ALL_VALUE_PARAMETER = '$__all';
