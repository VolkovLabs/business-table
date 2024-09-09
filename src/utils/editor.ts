import { identity, pickBy } from 'lodash';

import { ColumnEditorConfig, ColumnEditorType } from '@/types';

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
  pickBy(payload, identity) as TPayload;
