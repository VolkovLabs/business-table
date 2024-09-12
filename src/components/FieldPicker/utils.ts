import { Field } from '@grafana/data';
import { getFieldTypeIcon } from '@grafana/ui';

/**
 * Get Field Key
 */
export const getFieldKey = (source: string | number, name: string): string => `${source}:${name}`;

/**
 * Get Field Option
 * @param field
 * @param source
 */
export const getFieldOption = (field: Field, source: string | number) => ({
  value: getFieldKey(source, field.name),
  fieldName: field.name,
  label: getFieldKey(source, field.name),
  source,
  icon: getFieldTypeIcon(field),
});
