import { createTheme, Field, FieldType, getDisplayProcessor, toDataFrame, TypedVariableModel } from '@grafana/data';

import { CellAggregation, CellType, ColumnConfig, ColumnFilterMode, PanelOptions, TableConfig } from '@/types';

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
  },
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
 * Create Panel Options
 */
export const createPanelOptions = (
  options: Partial<PanelOptions & { groups: TableConfig[] }> = {}
): PanelOptions & { groups?: TableConfig[] } => ({
  tables: [],
  groups: [],
  ...options,
});
