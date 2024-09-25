import { DataFrame, dateTime, isValidDate } from '@grafana/data';

import { NestedObjectConfig, NestedObjectEditorConfig, NestedObjectItemPayload, NestedObjectType } from '@/types';
import { cleanPayloadObject } from '@/utils/editor';

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
    time: '',
    author: '',
    body: '',
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

/**
 * Nested Object Card GetterCa
 */
export class NestedObjectCardMapper {
  constructor(private readonly config: NestedObjectEditorConfig & { type: NestedObjectType.CARDS }) {}

  /**
   * Return String
   */
  private typeString(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    return '';
  }

  /**
   * Get Id
   */
  getId(item: Record<string, unknown>) {
    return item[this.config.id];
  }

  /**
   * Get Title
   */
  getTitle(item: Record<string, unknown>): string {
    return this.typeString(item[this.config.title]);
  }

  /**
   * Get Body
   */
  getBody(item: Record<string, unknown>): string {
    return this.typeString(item[this.config.body]);
  }

  /**
   * Get Author
   */
  getAuthor(item: Record<string, unknown>) {
    return item[this.config.author] as unknown;
  }

  /**
   * Get Time
   */
  getTime(item: Record<string, unknown>): string | number {
    const result = item[this.config.time];

    if (typeof result === 'string' && isValidDate(result)) {
      return result;
    }

    if (typeof result === 'number') {
      const date = dateTime(result);

      return date.isValid() ? result : '';
    }

    return '';
  }

  /**
   * Get Payload
   */
  getPayload(item: Record<string, unknown>): NestedObjectItemPayload {
    return cleanPayloadObject({
      id: this.getId(item),
      title: this.getTitle(item),
      body: this.getBody(item),
      author: this.getAuthor(item),
      time: this.getTime(item),
    }) as NestedObjectItemPayload;
  }

  /**
   * Create Object
   */
  createObject(payload: NestedObjectItemPayload) {
    return cleanPayloadObject({
      [this.config.id]: payload.id,
      [this.config.title]: payload.title,
      [this.config.body]: payload.body,
      [this.config.author]: payload.author,
      [this.config.time]: payload.time,
    });
  }

  /**
   * Create New Payload
   */
  createNewPayload(): NestedObjectItemPayload {
    const payload: NestedObjectItemPayload = {};

    if (this.config.title) {
      payload.title = '';
    }

    if (this.config.body) {
      payload.body = '';
    }

    return payload;
  }
}
