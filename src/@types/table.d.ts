import { RowData } from '@tanstack/react-table';

import { ColumnMeta as ColumnMetaOptions } from '../types';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface ColumnMeta<TData extends RowData, TValue> extends ColumnMetaOptions {}

  interface FilterMeta {
    from?: number;
    to?: number;
  }
}
