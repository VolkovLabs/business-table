import { DataFrame, Field } from '@grafana/data';

import { FieldSource } from '../types';

/**
 * Get Source Key
 * @param fieldSource
 */
export const getSourceKey = (fieldSource: FieldSource) => {
  if (fieldSource.refId) {
    return `${fieldSource.refId}:${fieldSource.name}`;
  }

  return fieldSource.name;
};

/**
 * Get Field by source
 */
export const getFieldBySource = (data: DataFrame[], fieldSource: FieldSource): Field | null => {
  for (const frame of data) {
    /**
     * Skip frame if different refId
     */
    if (fieldSource.refId && frame.refId !== fieldSource.refId) {
      continue;
    }

    const field = frame.fields.find((field) => field.name === fieldSource.name);

    if (field) {
      return field;
    }
  }

  return null;
};
