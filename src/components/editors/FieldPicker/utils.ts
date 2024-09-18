import { Field } from '@grafana/data';
import { getFieldTypeIcon } from '@grafana/ui';

import { getFieldKey } from '@/utils';

/**
 * Get Field Option
 * @param field
 * @param source
 */
export const getFieldOption = (field: Field, source: string | number) => ({
  value: getFieldKey({ source, name: field.name }),
  fieldName: field.name,
  label: getFieldKey({ source, name: field.name }),
  source,
  icon: getFieldTypeIcon(field),
});
