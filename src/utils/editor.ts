import {
  CellType,
  ColumnConfig,
  ColumnEditorConfig,
  ColumnEditorType,
  ColumnFilterMode,
  EditableColumnEditorRegistryItem,
  NestedObjectEditorRegistryItem,
  NestedObjectType,
  PaginationMode,
  TableConfig,
} from '@/types';

/**
 * Get Column Config
 */
export const getColumnConfigWithNewType = (value: ColumnConfig, type: CellType): ColumnConfig => {
  switch (type) {
    case CellType.NESTED_OBJECTS: {
      return {
        ...value,
        type,
        filter: {
          ...value.filter,
          enabled: false,
        },
        group: false,
        footer: [],
        edit: {
          ...value.edit,
          enabled: false,
        },
      };
    }

    default: {
      return {
        ...value,
        type,
      };
    }
  }
};

/**
 * Get Column Editor Config
 * @param type
 */
export const getColumnEditorConfig = (type: ColumnEditorType): ColumnEditorConfig & { type: typeof type } => {
  return {
    type,
  };
};

/**
 * Format Number Value
 * @param value
 * @constructor
 */
export const formatNumberValue = (value: unknown): string | number => {
  return typeof value === 'number' ? value : '';
};

/**
 * Clean Payload Object to remove all undefined properties
 */
export const cleanPayloadObject = <TPayload extends object>(payload: TPayload): TPayload =>
  Object.entries(payload).reduce((acc, [key, value]) => {
    if (value === undefined) {
      return acc;
    }

    return {
      ...acc,
      [key]: value,
    };
  }, {} as TPayload);

/**
 * Create Editable Column Registry Item
 * @param item
 */
export const createEditableColumnEditorRegistryItem = <TType extends ColumnEditorType>(
  item: EditableColumnEditorRegistryItem<TType>
): EditableColumnEditorRegistryItem<typeof item.id> => item;

/**
 * Create Editable Column Editors Registry
 * @param items
 */
export const createEditableColumnEditorsRegistry = <TRegistry extends { id: string }>(items: TRegistry[]) => {
  const itemsMap = new Map<TRegistry['id'], TRegistry>();

  items.forEach((item) => itemsMap.set(item.id, item));

  return itemsMap;
};

/**
 * Create Nested Object Registry Item
 * @param item
 */
export const createNestedObjectEditorRegistryItem = <TType extends NestedObjectType>(
  item: NestedObjectEditorRegistryItem<TType>
): NestedObjectEditorRegistryItem<typeof item.id> => item;

/**
 * Create Nested Object Editors Registry
 * @param items
 */
export const createNestedObjectEditorsRegistry = <TRegistry extends { id: string }>(items: TRegistry[]) => {
  const itemsMap = new Map<TRegistry['id'], TRegistry>();

  items.forEach((item) => itemsMap.set(item.id, item));

  return itemsMap;
};

/**
 * Has Table Pagination Query Disabled
 */
export const hasTablePaginationQueryDisabled = (item: TableConfig): boolean => {
  /**
   * Should be visible columns with enabled client filter
   */
  return (
    item.items.filter(
      (column) => column.enabled && column.filter.enabled && column.filter.mode === ColumnFilterMode.CLIENT
    ).length > 0
  );
};

/**
 * Has Table Pagination Error
 */
export const hasTablePaginationError = (item: TableConfig): boolean => {
  if (!item.pagination.enabled || item.pagination.mode === PaginationMode.CLIENT) {
    return false;
  }

  /**
   * Find visible columns with client filter
   */
  return hasTablePaginationQueryDisabled(item);
};
