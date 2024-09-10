import { ColumnEditorConfig, ColumnEditorType, EditableColumnEditorRegistryItem } from '@/types';

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
