import { DataFrame, Field } from '@grafana/data';
import { findField } from '@volkovlabs/components';

import { FieldSource } from '@/types';

/**
 * Get Field Key
 */
export const getFieldKey = (field: FieldSource): string => `${field.source}:${field.name}`;

/**
 * Reorder
 * @param list
 * @param startIndex
 * @param endIndex
 */
export const reorder = <T>(list: T[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Filter field by source
 * Frame should be already filtered
 * @param frame
 * @param field
 * @param fieldSource
 */
export const filterFieldBySource = (frame: DataFrame, field: Field, fieldSource: FieldSource): boolean => {
  return field.name === fieldSource.name;
};

/**
 * Get field by source
 */
export const getFieldBySource = (series: DataFrame[], fieldSource: FieldSource): Field | undefined => {
  return findField(series, (field, frame) => {
    return filterFieldBySource(frame as DataFrame, field as Field, fieldSource);
  }) as Field | undefined;
};

/**
 * Get frame by source
 */
export const getFrameBySource = (series: DataFrame[], fieldSource: FieldSource): DataFrame | undefined => {
  if (typeof fieldSource.source === 'number') {
    return series[fieldSource.source];
  }

  return series.find((frame) => frame.refId === fieldSource.source);
};
