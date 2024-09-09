import { createSelector } from '@volkovlabs/jest-selectors';

import { ColumnAlignment, ColumnEditConfig, EditPermissionMode } from '@/types';

/**
 * Default Column Appearance
 */
export const DEFAULT_COLUMN_APPEARANCE = {
  wrap: true,
  alignment: ColumnAlignment.START,
  width: {
    auto: true,
    min: 20,
    value: 100,
  },
  background: {
    applyToRow: false,
  },
};

/**
 * Default Column Edit
 */
export const DEFAULT_COLUMN_EDIT: ColumnEditConfig = {
  enabled: false,
  permission: {
    mode: EditPermissionMode.ALLOWED,
    field: {
      source: '',
      name: '',
    },
    userRole: [],
  },
};

/**
 * Actions Column ID
 */
export const ACTIONS_COLUMN_ID = '__actions';

/**
 * Test Identifiers
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
    fieldAppearanceWrap: createSelector('data-testid column-editor field-appearance-wrap'),
    fieldAppearanceAlignment: createSelector('data-testid column-editor field-appearance-alignment'),
    fieldAppearanceAlignmentOption: createSelector(
      (name: unknown) => `wcolumn-editor field-appearance-alignment-option-${name}`
    ),
  },
  defaultCellRenderer: {
    root: createSelector('data-testid default-cell-renderer'),
  },
  table: {
    root: createSelector('data-testid table'),
    headerCell: createSelector((name: unknown) => `data-testid table header-cell-${name}`),
    footerCell: createSelector((name: unknown) => `data-testid table footer-cell-${name}`),
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
  payloadEditor: {
    loadingMessage: createSelector('data-testid payload-editor loading-message'),
    errorMessage: createSelector('data-testid payload-editor error-message'),
  },
  datasourceEditor: {
    fieldSelect: createSelector('data-testid datasource-editor field-select'),
  },
};

/**
 * All Value Parameter
 */
export const ALL_VALUE_PARAMETER = '$__all';

/**
 * Auto Save timeout ms
 */
export const AUTO_SAVE_TIMEOUT = 1000;
