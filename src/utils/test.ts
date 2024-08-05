import { createTheme, Field, FieldType, getDisplayProcessor, toDataFrame } from '@grafana/data';

import { CellAggregation, CellType, ColumnConfig, ColumnFilterMode } from '../types';

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
    enabled: true,
    mode: ColumnFilterMode.CLIENT,
    variable: '',
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
