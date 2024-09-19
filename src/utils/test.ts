import {
  createTheme,
  DataFrame,
  Field,
  FieldType,
  getDisplayProcessor,
  toDataFrame,
  TypedVariableModel,
} from '@grafana/data';

import {
  CellAggregation,
  CellType,
  ColumnAlignment,
  ColumnAppearanceConfig,
  ColumnConfig,
  ColumnEditConfig,
  ColumnEditorType,
  ColumnFilterMode,
  ColumnMeta,
  ColumnPinDirection,
  EditPermissionMode,
  PaginationMode,
  PanelOptions,
  TableConfig,
  TablePaginationConfig,
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
  background: {
    applyToRow: false,
  },
  ...appearance,
});

/**
 * Create Column Edit Config
 */
export const createColumnEditConfig = (item: Partial<ColumnEditConfig>): ColumnEditConfig => ({
  enabled: false,
  permission: {
    mode: EditPermissionMode.ALLOWED,
    userRole: [],
  },
  editor: {
    type: ColumnEditorType.STRING,
  },
  ...item,
});

/**
 * Create Column Config
 */
export const createColumnConfig = (item: Partial<ColumnConfig> = {}): ColumnConfig => ({
  field: {
    name: 'field',
    source: 'A',
  },
  label: '',
  type: CellType.AUTO,
  group: false,
  aggregation: CellAggregation.NONE,
  filter: {
    enabled: false,
    mode: ColumnFilterMode.CLIENT,
    variable: '',
  },
  sort: {
    enabled: false,
    descFirst: false,
  },
  appearance: createColumnAppearanceConfig({}),
  footer: [],
  edit: createColumnEditConfig({}),
  pin: ColumnPinDirection.NONE,
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
 * Create Table Config
 */
export const createTableConfig = (table: Partial<TableConfig>): TableConfig => ({
  name: '',
  items: [],
  update: {
    datasource: '',
    payload: {},
  },
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
