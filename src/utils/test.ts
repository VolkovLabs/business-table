import {
  createTheme,
  DataFrame,
  Field,
  FieldType,
  getDisplayProcessor,
  LinkModel,
  toDataFrame,
  TypedVariableModel,
} from '@grafana/data';
import { ColumnDef } from '@tanstack/react-table';

import {
  CellAggregation,
  CellType,
  ColumnAlignment,
  ColumnAppearanceConfig,
  ColumnConfig,
  ColumnEditConfig,
  ColumnEditorType,
  ColumnFilterConfig,
  ColumnFilterMode,
  ColumnHeaderFontSize,
  ColumnMeta,
  ColumnPinDirection,
  ColumnSortConfig,
  NestedObjectCardsDisplay,
  NestedObjectConfig,
  NestedObjectControlOperationOptions,
  NestedObjectEditorConfig,
  NestedObjectOperationConfig,
  NestedObjectType,
  PaginationMode,
  PanelOptions,
  PermissionConfig,
  PermissionMode,
  TableConfig,
  TablePaginationConfig,
  TableRequestConfig,
  ToolbarOptions,
} from '@/types';

/**
 * Create Column Appearance Config
 */
export const createColumnAppearanceConfig = (appearance: Partial<ColumnAppearanceConfig>): ColumnAppearanceConfig => ({
  width: {
    auto: false,
    value: 100,
  },
  wrap: false,
  alignment: ColumnAlignment.START,
  fontSize: ColumnHeaderFontSize.MD,
  background: {
    applyToRow: false,
  },
  colors: {},
  ...appearance,
});

/**
 * Create Permission Config
 */
export const createPermissionConfig = (permission: Partial<PermissionConfig>): PermissionConfig => ({
  mode: PermissionMode.ALLOWED,
  userRole: [],
  ...permission,
});

/**
 * Create Column Edit Config
 */
export const createColumnEditConfig = (item: Partial<ColumnEditConfig>): ColumnEditConfig => ({
  enabled: false,
  permission: createPermissionConfig({}),
  editor: {
    type: ColumnEditorType.STRING,
  },
  ...item,
});

/**
 * Create Column Filter Config
 */
export const createColumnFilterConfig = (item: Partial<ColumnFilterConfig>): ColumnFilterConfig => ({
  enabled: false,
  mode: ColumnFilterMode.CLIENT,
  variable: '',
  ...item,
});

/**
 * Create Column Sort Config
 */
export const createColumnSortConfig = (item: Partial<ColumnSortConfig>): ColumnSortConfig => ({
  enabled: false,
  descFirst: false,
  ...item,
});

/**
 * Create Column Config
 */
export const createColumnConfig = (item: Partial<ColumnConfig> = {}): ColumnConfig => ({
  enabled: true,
  field: {
    name: 'field',
    source: 'A',
  },
  label: '',
  type: CellType.AUTO,
  group: false,
  aggregation: CellAggregation.NONE,
  filter: createColumnFilterConfig({}),
  sort: createColumnSortConfig({}),
  appearance: createColumnAppearanceConfig({}),
  footer: [],
  edit: createColumnEditConfig({}),
  pin: ColumnPinDirection.NONE,
  objectId: '',
  ...item,
});

/**
 * Create field
 */
export const createField = (field: Partial<Field>): Field => {
  const finalField: Field = {
    name: 'test',
    type: FieldType.number,
    config: {},
    values: [],
    display: (v) => getDisplayProcessor({ field: finalField, theme: createTheme() })(v),
    ...field,
  };
  const frame = toDataFrame({
    fields: [finalField],
  });

  return frame.fields[0];
};

/**
 * Create variable
 */
export const createVariable = (
  item: Partial<Omit<TypedVariableModel, 'current'>> & { current?: { value: string | string[] } }
): TypedVariableModel & { type: (typeof item)['type'] } =>
  ({
    name: 'test',
    type: 'query',
    datasource: null,
    definition: '',
    sort: '' as never,
    current: {
      value: '',
    } as never,
    ...item,
  }) as never;

/**
 * Create Toolbar Options
 */
export const createToolbarOptions = (toolbar: Partial<ToolbarOptions>): ToolbarOptions => ({
  export: false,
  ...toolbar,
});

/**
 * Create Panel Options
 */
export const createPanelOptions = (options: Partial<PanelOptions> = {}): PanelOptions => ({
  tables: [],
  tabsSorting: false,
  toolbar: createToolbarOptions({}),
  nestedObjects: [],
  ...options,
});

/**
 * Create Column Meta
 */
export const createColumnMeta = (meta: Partial<ColumnMeta>): ColumnMeta => ({
  availableFilterTypes: [],
  filterVariableName: '',
  filterMode: ColumnFilterMode.CLIENT,
  config: createColumnConfig(),
  field: {} as never,
  footerEnabled: false,
  editable: false,
  ...meta,
});

/**
 * Footer Context
 */
export class FooterContext {
  private rows: unknown[] = [];

  table = {
    getFilteredRowModel: () => {
      return {
        rows: this.rows,
      };
    },
  };

  column = {
    id: '',
  };

  constructor(columnId: string) {
    this.column.id = columnId;
  }

  setRows(rows: Array<Record<string, unknown>>) {
    this.rows = rows.map((row) => {
      return {
        getValue: (columId: string) => row[columId],
      };
    });

    return this;
  }
}

/**
 * Create Table Pagination Config
 */
export const createTablePaginationConfig = (pagination: Partial<TablePaginationConfig>): TablePaginationConfig => ({
  enabled: false,
  mode: PaginationMode.CLIENT,
  ...pagination,
});

/**
 * Create Table Request Config
 */
export const createTableRequestConfig = (item: Partial<TableRequestConfig>): TableRequestConfig => ({
  datasource: '',
  payload: {},
  ...item,
});

/**
 * Create Table Config
 */
export const createTableConfig = (table: Partial<TableConfig>): TableConfig => ({
  name: '',
  items: [],
  update: createTableRequestConfig({}),
  pagination: createTablePaginationConfig({}),
  ...table,
});

/**
 * Data Frame To Object Array
 */
export const dataFrameToObjectArray = (dataFrame: DataFrame): Array<Record<string, unknown>> => {
  const result: Array<Record<string, unknown>> = [];

  dataFrame.fields.forEach((field) => {
    field.values.forEach((value, rowIndex) => {
      if (!result[rowIndex]) {
        result[rowIndex] = {};
      }

      result[rowIndex][field.name] = value;
    });
  });

  return result;
};

/**
 * Create Data Link
 */
export const createDataLink = (link: Partial<LinkModel>): LinkModel => ({
  origin: '',
  href: '',
  target: '_blank',
  title: '',
  ...link,
});

/**
 * Create Nested Object Editor Config
 */
export const createNestedObjectEditorConfig = (item: Partial<NestedObjectEditorConfig>): NestedObjectEditorConfig => ({
  type: NestedObjectType.CARDS,
  id: '',
  title: '',
  author: '',
  body: '',
  time: '',
  display: NestedObjectCardsDisplay.NONE,
  displayCount: null,
  ...item,
});

/**
 * Create Nested Object Operation Config
 */
export const createNestedObjectOperationConfig = (
  item: Partial<NestedObjectOperationConfig>
): NestedObjectOperationConfig => ({
  enabled: false,
  permission: createPermissionConfig({}),
  request: createTableRequestConfig({}),
  ...item,
});

/**
 * Create Nested Object Config
 */
export const createNestedObjectConfig = (item: Partial<NestedObjectConfig>): NestedObjectConfig => ({
  id: '',
  type: NestedObjectType.CARDS,
  editor: createNestedObjectEditorConfig({}),
  name: '',
  get: createTableRequestConfig({}),
  ...item,
});

/**
 * Create Nested Object Operation Options
 */
export const createNestedObjectOperationOptions = (
  item: Partial<NestedObjectControlOperationOptions>
): NestedObjectControlOperationOptions => ({
  enabled: false,
  request: createTableRequestConfig({}),
  ...item,
});

/**
 * Get ColumnDef Value
 */
export const getColumnDefValue = (column: ColumnDef<unknown>, rowData: Record<string, unknown>): unknown => {
  if ('accessorFn' in column) {
    return column.accessorFn(rowData, 0);
  }

  return undefined;
};
