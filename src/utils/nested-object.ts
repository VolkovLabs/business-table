import { DataFrame } from '@grafana/data';

import { NestedObjectConfig, NestedObjectEditorConfig, NestedObjectType } from '@/types';

/**
 * Get Nested Object Editor Config
 */
export const getNestedObjectEditorConfig = (
  type: NestedObjectType
): NestedObjectEditorConfig & { type: typeof type } => {
  return {
    type,
    id: '',
    title: '',
  };
};

/**
 * Prepare Frame For Nested Object
 */
export const prepareFrameForNestedObject = (
  object: NestedObjectConfig,
  frame: DataFrame
): Map<string, Record<string, unknown>> => {
  const idKey = object.editor.id || 'id';

  const objects: Array<Record<string, unknown>> = [];

  /**
   * Convert Frame To Objects Array
   */
  for (const field of frame.fields) {
    for (let rowIndex = 0; rowIndex < field.values.length; rowIndex += 1) {
      if (!objects[rowIndex]) {
        objects[rowIndex] = {};
      }

      objects[rowIndex][field.name] = field.values[rowIndex];
    }
  }

  return objects.reduce((acc, object) => {
    acc.set(object[idKey] as string, object);
    return acc;
  }, new Map<string, Record<string, unknown>>());
};
