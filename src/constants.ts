import { selectors } from '@grafana/e2e-selectors';
import { createSelector } from '@volkovlabs/jest-selectors';

import {
  CellAggregation,
  ColumnAlignment,
  ColumnEditConfig,
  ColumnEditorType,
  ColumnHeaderFontSize,
  ColumnNewRowEditConfig,
  PermissionConfig,
  PermissionMode,
  SupportedBase64ImageType,
  TableRequestConfig,
  ToolbarButtonsAlignment,
} from '@/types';

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
  header: {
    fontSize: ColumnHeaderFontSize.MD,
  },
  colors: {},
  background: {
    applyToRow: false,
  },
};

/**
 * Default Request Config
 */
export const DEFAULT_REQUEST_CONFIG: TableRequestConfig = {
  datasource: '',
  payload: {},
};

/**
 * Default Permission Config
 */
export const DEFAULT_PERMISSION_CONFIG: PermissionConfig = {
  mode: PermissionMode.ALLOWED,
  userRole: [],
};

/**
 * Default Column Edit Config
 */
export const DEFAULT_COLUMN_EDIT_CONFIG: ColumnEditConfig = {
  enabled: false,
  permission: DEFAULT_PERMISSION_CONFIG,
  editor: {
    type: ColumnEditorType.STRING,
  },
};

/**
 * Default Column New Row Edit Config
 */
export const DEFAULT_COLUMN_NEW_ROW_EDIT_CONFIG: ColumnNewRowEditConfig = {
  enabled: false,
  editor: {
    type: ColumnEditorType.STRING,
  },
};

/**
 * Actions Column ID
 */
export const ACTIONS_COLUMN_ID = '__actions';

/**
 * Row Highlight State Key
 */
export const ROW_HIGHLIGHT_STATE_KEY = '__rowHighlightStateKey';

/**
 * Test Identifiers
 */
export const TEST_IDS = {
  panel: {
    root: createSelector('data-testid panel'),
    tab: createSelector((name: unknown) => `data-testid panel tab-${name}`),
    buttonDownload: createSelector('data-testid panel button-download'),
    buttonFormat: createSelector('data-testid panel button-format'),
    dropdown: createSelector('data-testid panel dropdown'),
    buttonSetFormat: createSelector((name: unknown) => `data-testid panel button-set-format-${name}`),
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
  actionColumnsEditor: {
    root: createSelector('data-testid action-columns-editor'),
    fieldLabel: createSelector('data-testid action-columns-editor field-label'),
    fieldHeaderFontSize: createSelector('data-testid action-columns-editor field-font-size'),
    fieldHeaderFontSizeOption: createSelector((name: unknown) => `action-columns-editor field-font-size-${name}`),
    fieldAppearanceWidthAuto: createSelector('data-testid action-columns-editor field-appearance-width-auto'),
    fieldAppearanceWidthMin: createSelector('data-testid action-columns-editor field-appearance-width-min'),
    fieldAppearanceWidthMax: createSelector('data-testid action-columns-editor field-appearance-width-max'),
    fieldAppearanceWidthValue: createSelector('data-testid action-columns-editor field-appearance-width-value'),
    fieldAppearanceAlignment: createSelector('data-testid action-columns-editor field-appearance-alignment'),
    fieldAppearanceAlignmentOption: createSelector(
      (name: unknown) => `action-columns-editor field-appearance-alignment-option-${name}`
    ),
    itemHeader: createSelector(`data-testid action-columns-editor item-header`),
    itemContent: createSelector(`data-testid action-columns-editor item-content`),
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
    fieldShowingRows: createSelector('data-testid column-editor field-showing-rows'),
    fieldPreformattedStyles: createSelector('data-testid column-editor field-preformatted-styles'),
    fieldAppearanceWidthAuto: createSelector('data-testid column-editor field-appearance-width-auto'),
    fieldAppearanceWidthMin: createSelector('data-testid column-editor field-appearance-width-min'),
    fieldAppearanceWidthMax: createSelector('data-testid column-editor field-appearance-width-max'),
    fieldAppearanceWidthValue: createSelector('data-testid column-editor field-appearance-width-value'),
    fieldHeaderBackgroundColor: createSelector('data-testid column-editor field-header-background-color'),
    fieldHeaderFontColor: createSelector('data-testid column-editor field-header-font-color'),
    fieldHeaderFontSize: createSelector('data-testid column-editor field-font-size'),
    fieldHeaderFontSizeOption: createSelector((name: unknown) => `column-editor field-font-size-${name}`),
    fieldAppearanceWrap: createSelector('data-testid column-editor field-appearance-wrap'),
    fieldAppearanceAlignment: createSelector('data-testid column-editor field-appearance-alignment'),
    fieldAppearanceAlignmentOption: createSelector(
      (name: unknown) => `column-editor field-appearance-alignment-option-${name}`
    ),
    fieldScale: createSelector('data-testid column-editor field-scale'),
    fieldGaugeDisplayMode: createSelector('data-testid column-editor field-gauge-display-mode'),
    fieldGaugeDisplayModeOption: createSelector((name: unknown) => `column-editor field-gauge-display-mode-${name}`),
    fieldGaugeValueDisplay: createSelector('data-testid column-editor field-gauge-value-display'),
    fieldGaugeValueDisplayOption: createSelector((name: unknown) => `column-editor field-gauge-value-mode-${name}`),
    fieldGaugeValueTextSize: createSelector('data-testid column-editor field-gauge-value'),
  },
  defaultCellRenderer: {
    root: createSelector('data-testid default-cell-renderer'),
  },
  preformattedCellRenderer: {
    root: createSelector('data-testid preformatted-cell-renderer'),
  },
  layoutCellRenderer: {
    root: createSelector('data-testid layout-cell-renderer'),
  },
  booleanCellRenderer: {
    root: createSelector('data-testid boolean-cell-renderer'),
  },
  aggregatedCellRenderer: {
    root: createSelector('data-testid aggregated-cell-renderer'),
  },
  imageCellRenderer: {
    root: createSelector('data-testid image-cell-renderer'),
  },
  gaugeCellRenderer: {
    root: createSelector('data-testid gauge-cell-renderer root'),
    gauge: createSelector('data-testid gauge-cell-renderer gauge'),
    error: createSelector('data-testid gauge-cell-renderer error'),
  },
  jsonCellRenderer: {
    formattedText: createSelector('data-testid json-cell-renderer formatted-text'),
    buttonOpenDrawer: createSelector('data-testid json-cell-renderer button-open-drawer'),
    error: createSelector('data-testid json-cell-renderer error'),
    buttonCloseDrawer: createSelector(selectors.components.Drawer.General.close),
    codeEditor: createSelector('json-cell-renderer code-editor'),
  },
  table: {
    root: createSelector('data-testid table'),
    headerRow: createSelector((name: unknown) => `data-testid table header-row-${name}`),
    headerCell: createSelector((name: unknown) => `data-testid table header-cell-${name}`),
    footerCell: createSelector((name: unknown) => `data-testid table footer-cell-${name}`),
    newRowContainer: createSelector('data-testid table new-row-container'),
    body: createSelector('data-testid table body'),
    bodyRow: createSelector((name: unknown) => `data-testid table body-row-${name}`),
    bodyCell: createSelector((name: unknown) => `data-testid table body-cell-${name}`),
    buttonExpandCell: createSelector((name: unknown) => `table button-expand-cell-${name}`),
    pagination: createSelector('data-testid table pagination'),
    fieldPageNumber: createSelector('data-testid table field-page-number'),
    fieldPageSize: createSelector('data-testid table field-page-size'),
  },
  tableHeaderCell: {
    root: createSelector('data-testid table-header-cell'),
    buttonAddRow: createSelector('data-testid table-header-cell button-add-row'),
    actionHeaderText: createSelector('data-testid table-header-cell action-header-text'),
    sortIcon: createSelector((iconName: unknown) => String(iconName), 'data-testid'),
  },
  tableCell: {
    tableLink: createSelector((name: unknown) => `table link-${name}`),
    tableLinkMenu: createSelector('table link-menu'),
    totalSubRows: createSelector('data-testid table total-sub-rows'),
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
    fieldCustomValues: createSelector('data-testid column-editor field-custom-values'),
    fieldFileMimeTypes: createSelector('data-testid column-editor field-file-mime-types'),
    fieldFileMaxSize: createSelector('data-testid column-editor field-file-max-size'),
    fieldFileLimit: createSelector('data-testid column-editor field-file-limit'),
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
    fieldBoolean: createSelector('data-testid editableCell field-boolean'),
    fieldFile:createSelector('data-testid editableCell field-file'),
  },
  tableActionsCell: {
    buttonStartEdit: createSelector('data-testid table-actions-cell button-start-edit'),
    buttonDelete: createSelector('data-testid table-actions-cell button-delete'),
    buttonCancel: createSelector('data-testid table-actions-cell button-cancel'),
    buttonSave: createSelector('data-testid table-actions-cell button-save'),
  },
  tableEditor: {
    fieldShowHeader: createSelector('data-testid table-editor field-show-header'),
    updateSectionHeader: createSelector('data-testid table-editor update-section-header'),
    updateSectionContent: createSelector('data-testid table-editor update-section-content'),
    fieldExpanded: createSelector('data-testid table-editor field-expanded'),
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
  tableAddRowEditor: {
    requestSectionHeader: createSelector('data-testid table-add-row-editor update-section-header'),
    requestSectionContent: createSelector('data-testid table-add-row-editor update-section-content'),
    columnHeader: createSelector((name: unknown) => `data-testid table-add-row-editor column-header-${name}`),
    columnContent: createSelector((name: unknown) => `data-testid table-add-row-editor column-content-${name}`),
    fieldEditQuickEnabled: createSelector(
      (name: unknown) => `data-testid table-add-row-editor field-edit-quick-enabled-${name}`
    ),
    noColumnsMessage: createSelector('data-testid table-add-row-editor no-columns-message'),
    disabledHeaderMessage: createSelector('data-testid table-add-row-editor disabled-header-message'),
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
  addDataEditor: {
    itemHeader: createSelector((name: unknown) => `data-testid add-data-editor item-header-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid add-data-editor item-content-${name}`),
    fieldItemEnabled: createSelector((name: unknown) => `data-testid add-data-editor field-item-enabled-${name}`),
  },
  highlightDataEditor: {
    itemHeader: createSelector((name: unknown) => `data-testid highlight-data-editor item-header-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid highlight-data-editor item-content-${name}`),
    fieldItemEnabled: createSelector((name: unknown) => `data-testid highlight-data-editor field-item-enabled-${name}`),
  },
  deleteDataEditor: {
    itemHeader: createSelector((name: unknown) => `data-testid delete-data-editor item-header-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid delete-data-editor item-content-${name}`),
    fieldItemEnabled: createSelector((name: unknown) => `data-testid delete-data-editor field-item-enabled-${name}`),
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
    fieldPaginationDefaultPageSize: createSelector('data-testid table-editor field-pagination-default-page-size'),
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
  colorEditor: {
    fieldValue: createSelector('data-testid color-editor field-value'),
    buttonClear: createSelector('data-testid color-editor button-clear'),
  },
  rowHighlightEditor: {
    fieldColumn: createSelector('data-testid row-highlight-editor field-column'),
    fieldVariable: createSelector('data-testid row-highlight-editor field-variable'),
    fieldBackgroundColor: createSelector('data-testid row-highlight-editor field-background-color'),
    fieldScrollTo: createSelector('data-testid row-highlight-editor field-scroll-to'),
    scrollToOption: createSelector((name: unknown) => `row-highlight-editor scroll-to-option-${name}`),
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

/**
 * Page Sizes
 */
export const PAGE_SIZES = [10, 20, 50, 100, 1000];

/**
 * Page Size Options
 */
export const PAGE_SIZE_OPTIONS = PAGE_SIZES.map((value) => ({
  value,
  label: value.toString(),
}));

/**
 * Base64 image header reg.
 */
export const BASE64_IMAGE_HEADER_REGEX = /^data:image\/\w+/;

/**
 * Base64 symbols for Image Types
 */
export const IMAGE_TYPES_SYMBOLS: { [id: string]: string } = {
  '/': SupportedBase64ImageType.JPEG,
  R: SupportedBase64ImageType.GIF,
  i: SupportedBase64ImageType.PNG,
  A: SupportedBase64ImageType.HEIC,
};

/**
 * Buttons Alignment options
 */
export const TOOLBAR_BUTTONS_ALIGNMENT = [
  {
    value: ToolbarButtonsAlignment.LEFT,
    label: 'Left',
  },
  {
    value: ToolbarButtonsAlignment.RIGHT,
    label: 'Right',
  },
];

/**
 * Gauge default value size
 */
export const GAUGE_DEFAULT_VALUE_SIZE = 14;

/**
 * Default showing rows
 */
export const DEFAULT_SHOWING_ROWS = 20;
