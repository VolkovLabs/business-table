import { selectors } from '@grafana/e2e-selectors';
import { createSelector } from '@volkovlabs/jest-selectors';

import { CellAggregation, ColumnAlignment, ColumnEditConfig, ColumnEditorType, PermissionMode } from '@/types';

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
    mode: PermissionMode.ALLOWED,
    userRole: [],
  },
  editor: {
    type: ColumnEditorType.STRING,
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
    buttonDownload: createSelector('data-testid panel button-download'),
  },
  tablesEditor: {
    buttonAddNew: createSelector('data-testid tables-editor button-add-new'),
    buttonRemove: createSelector('data-testid tables-editor button-remove'),
    buttonStartRename: createSelector('data-testid tables-editor button-start-rename'),
    buttonCancelRename: createSelector('data-testid tables-editor button-cancel-rename'),
    buttonSaveRename: createSelector('data-testid tables-editor button-save-rename'),
    fieldName: createSelector('data-testid tables-editor field-name'),
    item: createSelector((name: unknown) => `data-testid tables-editor item-${name}`),
    itemHeader: createSelector((name: unknown) => `data-testid tables-editor item-header-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid tables-editor item-content-${name}`),
    newItem: createSelector('data-testid tables-editor new-level'),
    newItemName: createSelector('data-testid tables-editor new-item-name'),
    noItemsMessage: createSelector('data-testid tables-editor no-items-message'),
  },
  columnsEditor: {
    buttonAddNew: createSelector('data-testid columns-editor button-add-new'),
    buttonRemove: createSelector('data-testid columns-editor button-remove'),
    buttonToggleVisibility: createSelector('data-testid columns-editor button-toggle-visibility'),
    itemHeader: createSelector((name: unknown) => `data-testid columns-editor item-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid columns-editor item-content-${name}`),
    newItem: createSelector('data-testid columns-editor new-item'),
    newItemName: createSelector('data-testid columns-editor new-item-name'),
    root: createSelector('data-testid columns-editor'),
  },
  columnEditor: {
    fieldLabel: createSelector('data-testid column-editor field-label'),
    fieldType: createSelector('data-testid column-editor field-type'),
    fieldObjectId: createSelector('data-testid column-editor field-object-id'),
    fieldGroup: createSelector('data-testid column-editor field-group'),
    fieldAggregation: createSelector('data-testid column-editor field-aggregation'),
    fieldFilterEnabled: createSelector('data-testid column-editor field-filter-enabled'),
    fieldFilterMode: createSelector('data-testid column-editor field-filter-mode'),
    fieldFilterVariable: createSelector('data-testid column-editor field-filter-variable'),
    fieldSortEnabled: createSelector('data-testid column-editor field-sort-enabled'),
    fieldSortDirection: createSelector('data-testid column-editor field-sort-direction'),
    sortDirectionOption: createSelector((name: unknown) => `column-editor sort-direction-${name}`),
    fieldPinDirection: createSelector('data-testid column-editor field-pin-direction'),
    pinDirectionOption: createSelector((name: unknown) => `column-editor pin-direction-${name}`),
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
  aggregatedCellRenderer: {
    root: createSelector('data-testid aggregated-cell-renderer'),
  },
  table: {
    root: createSelector('data-testid table'),
    headerRow: createSelector((name: unknown) => `data-testid table header-row-${name}`),
    headerCell: createSelector((name: unknown) => `data-testid table header-cell-${name}`),
    footerCell: createSelector((name: unknown) => `data-testid table footer-cell-${name}`),
    bodyRow: createSelector((name: unknown) => `data-testid table body-row-${name}`),
    bodyCell: createSelector((name: unknown) => `data-testid table body-cell-${name}`),
    buttonExpandCell: createSelector((name: unknown) => `table button-expand-cell-${name}`),
    pagination: createSelector('data-testid table pagination'),
    fieldPageNumber: createSelector('data-testid table field-page-number'),
    fieldPageSize: createSelector('data-testid table field-page-size'),
  },
  tableHeaderCell: {
    root: createSelector('data-testid table-header-cell'),
    sortIcon: createSelector((iconName: unknown) => String(iconName), 'data-testid'),
  },
  tableCell: {
    tableLink: createSelector((name: unknown) => `table link-${name}`),
    tableLinkMenu: createSelector('table link-menu'),
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
  editableColumnEditor: {
    fieldType: createSelector('data-testid column-editor field-type'),
    fieldNumberMin: createSelector('data-testid column-editor field-number-min'),
    fieldNumberMax: createSelector('data-testid column-editor field-number-max'),
    fieldDatetimeMin: createSelector('data-testid column-editor field-datetime-min'),
    fieldDatetimeMax: createSelector('data-testid column-editor field-datetime-max'),
  },
  dateEditor: {
    field: createSelector('data-testid date-editor field'),
    buttonRemoveDate: createSelector('data-testid date-editor button-remove-date'),
    buttonSetDate: createSelector('data-testid date-editor button-set-date'),
  },
  queryOptionsEditor: {
    fieldValue: createSelector('data-testid query-options-editor field-value'),
    fieldLabel: createSelector('data-testid query-options-editor field-label'),
  },
  editableCell: {
    fieldString: createSelector('data-testid editableCell field-string'),
    fieldNumber: createSelector('data-testid editableCell field-number'),
    fieldDatetime: createSelector('data-testid editableCell field-datetime'),
    fieldSelect: createSelector('data-testid editableCell field-select'),
    fieldTextarea: createSelector('data-testid editableCell field-textarea'),
  },
  tableActionsCell: {
    buttonStartEdit: createSelector('data-testid table-actions-cell button-start-edit'),
    buttonCancel: createSelector('data-testid table-actions-cell button-cancel'),
    buttonSave: createSelector('data-testid table-actions-cell button-save'),
  },
  tableEditor: {
    updateSectionHeader: createSelector('data-testid table-editor update-section-header'),
    updateSectionContent: createSelector('data-testid table-editor update-section-content'),
  },
  fieldPicker: {
    root: createSelector('data-testid field-picker'),
  },
  tableUpdateEditor: {
    updateSectionHeader: createSelector('data-testid table-update-editor update-section-header'),
    updateSectionContent: createSelector('data-testid table-update-editor update-section-content'),
    columnHeader: createSelector((name: unknown) => `data-testid table-update-editor column-header-${name}`),
    columnContent: createSelector((name: unknown) => `data-testid table-update-editor column-content-${name}`),
    fieldEditQuickEnabled: createSelector(
      (name: unknown) => `data-testid table-update-editor field-edit-quick-enabled-${name}`
    ),
    noColumnsMessage: createSelector('data-testid table-update-editor no-columns-message'),
  },
  buttonSelect: {
    root: createSelector('button-select root'),
    dropdown: createSelector('button-select dropdown'),
    option: createSelector((name: unknown) => `button-select option-${name}`),
  },
  editableDataEditor: {
    itemHeader: createSelector((name: unknown) => `data-testid editable-data-editor item-header-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid editable-data-editor item-content-${name}`),
  },
  nestedObjectEditor: {
    fieldType: createSelector('data-testid nested-object-editor field-type'),
    getRequestSectionHeader: createSelector('data-testid nested-object-editor get-request-section-header'),
    getRequestSectionContent: createSelector('data-testid nested-object-editor get-request-section-content'),
    operationSectionHeader: createSelector(
      (name: unknown) => `data-testid nested-object-editor operation-${name}-section-header`
    ),
    operationSectionContent: createSelector(
      (name: unknown) => `data-testid nested-object-editor operation-${name}-section-content`
    ),
    fieldOperationEnabled: createSelector(
      (name: unknown) => `data-testid nested-object-editor field-operation-${name}-enabled`
    ),
  },
  nestedObjectCardsEditor: {
    fieldId: createSelector('data-testid nested-object-cards-editor field-id'),
    fieldTitle: createSelector('data-testid nested-object-cards-editor field-title'),
    fieldTime: createSelector('data-testid nested-object-cards-editor field-time'),
    fieldAuthor: createSelector('data-testid nested-object-cards-editor field-author'),
    fieldBody: createSelector('data-testid nested-object-cards-editor field-body'),
    fieldDisplay: createSelector('data-testid nested-object-cards-editor field-display'),
    fieldDisplayCount: createSelector('data-testid nested-object-cards-editor field-display-count'),
    option: createSelector((name: unknown) => `nested-object-cards-editor options-${name}`),
  },
  nestedObjectCardContent: {
    root: createSelector('data-testid nested-object-card-content'),
  },
  nestedObjectCardsItem: {
    root: createSelector('data-testid nested-object-cards-item'),
    header: createSelector('nested-object-cards-item header'),
    fieldTitle: createSelector('data-testid nested-object-cards-item field-title'),
    fieldBody: createSelector('nested-object-cards-item field-body'),
    buttonCancelEdit: createSelector('data-testid nested-object-cards-item button-cancel-edit'),
    buttonSaveEdit: createSelector('data-testid nested-object-cards-item button-save-edit'),
    buttonStartEdit: createSelector('data-testid nested-object-cards-item button-start-edit'),
    buttonStartDelete: createSelector('data-testid nested-object-cards-item button-start-delete'),
    modalConfirmDelete: createSelector('data-testid nested-object-cards-item modal-confirm-delete'),
  },
  nestedObjectCardsAdd: {
    buttonAdd: createSelector('data-testid nested-object-cards-add button-add'),
  },
  nestedObjectCardsControl: {
    loadingIcon: createSelector('spinner', 'data-testid'),
    buttonShowItems: createSelector('data-testid nested-object-cards-control button-show-items'),
    noItemsMessage: createSelector('data-testid nested-object-cards-control no-items-message'),
    buttonCloseDrawer: createSelector(selectors.components.Drawer.General.close),
    list: createSelector('data-testid nested-object-cards-control list'),
  },
  nestedObjectsEditor: {
    buttonAddNew: createSelector('data-testid nested-objects-editor button-add-new'),
    buttonRemove: createSelector('data-testid nested-objects-editor button-remove'),
    buttonStartRename: createSelector('data-testid nested-objects-editor button-start-rename'),
    buttonCancelRename: createSelector('data-testid nested-objects-editor button-cancel-rename'),
    buttonSaveRename: createSelector('data-testid nested-objects-editor button-save-rename'),
    fieldName: createSelector('data-testid nested-objects-editor field-name'),
    itemHeader: createSelector((name: unknown) => `data-testid nested-objects-editor item-header-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid nested-objects-editor item-content-${name}`),
    newItem: createSelector('data-testid nested-objects-editor new-level'),
    newItemName: createSelector('data-testid nested-objects-editor new-item-name'),
    noItemsMessage: createSelector('data-testid nested-objects-editor no-items-message'),
  },
  nestedObjectOperationEditor: {
    requestSectionHeader: createSelector('data-testid nested-object-operation-editor request-section-header'),
    requestSectionContent: createSelector('data-testid nested-object-operation-editor request-section-content'),
  },
  permissionEditor: {
    fieldMode: createSelector('data-testid permission-editor field-mode'),
    fieldOrgRole: createSelector('data-testid permission-editor field-org-role'),
    fieldPicker: createSelector('data-testid permission-editor field-picker'),
  },
  paginationsEditor: {
    itemHeader: createSelector((name: unknown) => `data-testid editable-data-editor item-header-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid editable-data-editor item-content-${name}`),
    fieldPaginationEnabled: createSelector(
      (name: unknown) => `data-testid table-editor field-pagination-enabled-${name}`
    ),
  },
  paginationEditor: {
    fieldPaginationMode: createSelector('data-testid table-editor field-pagination-mode'),
    fieldPaginationQueryPageIndexVariable: createSelector(
      'data-testid table-editor field-pagination-query-page-index-variable'
    ),
    fieldPaginationQueryPageSizeVariable: createSelector(
      'data-testid table-editor field-pagination-query-page-size-variable'
    ),
    fieldPaginationQueryOffsetVariable: createSelector(
      'data-testid table-editor field-pagination-query-offset-variable'
    ),
    fieldPaginationQueryTotalCount: createSelector('data-testid table-editor field-pagination-query-total-count'),
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

/**
 * Aggregation Type acceptable for display processor
 */
export const AGGREGATION_TYPES_WITH_DISPLAY_PROCESSOR = [
  CellAggregation.MIN,
  CellAggregation.MAX,
  CellAggregation.MEAN,
  CellAggregation.MEDIAN,
  CellAggregation.SUM,
];
