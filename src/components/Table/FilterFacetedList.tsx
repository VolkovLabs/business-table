import { getTemplateSrv } from '@grafana/runtime';
import { Checkbox, useStyles2 } from '@grafana/ui';
import { Header } from '@tanstack/react-table';
import React, { useMemo } from 'react';

import { ALL_VALUE_PARAMETER } from '../../constants';
import { ColumnFilterMode } from '../../types';
import { getStyles } from './Table.styles';

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Header
   */
  header: Header<TData, unknown>;

  /**
   * Change
   */
  onChange: (value: string[]) => void;

  /**
   * Value
   *
   * @type {string[]}
   */
  value: string[];
}

/**
 * Filter Faceted List
 */
export const FilterFacetedList = <TData,>({ header: { column }, value, onChange }: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Selected values as map to check selection state
   */
  const valueMap = useMemo(() => {
    return value.reduce((acc, item) => {
      acc.set(item, true);
      return acc;
    }, new Map<string, boolean>());
  }, [value]);

  /**
   * Sorted Unique Options
   */
  const sortedUniqueOptions = useMemo(() => {
    /**
     * Get options from variable if query mode
     */
    if (column.columnDef.meta?.filterMode === ColumnFilterMode.QUERY) {
      const variableName = column.columnDef.meta.filterVariableName;
      const variable = getTemplateSrv()
        .getVariables()
        .find((item) => item.name === variableName);

      if (!variable || !('options' in variable)) {
        return [];
      }

      return variable.options
        .filter((option) => option.value !== ALL_VALUE_PARAMETER)
        .map((option) => ({
          value: option.value,
          label: option.text || option.value,
        }));
    }

    /**
     * Get options based on column values
     */
    const values = Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000);

    return values.map((value) => ({
      value,
      label: value,
    }));
  }, [column]);

  return (
    <ul className={styles.filterFacetedList}>
      <li>
        <Checkbox
          checked={value.length === sortedUniqueOptions.length}
          indeterminate={value.length > 0 && sortedUniqueOptions.length > value.length}
          label="All"
          onChange={() => {
            if (value.length === sortedUniqueOptions.length) {
              onChange([]);
            } else {
              onChange(sortedUniqueOptions.map(({ value }) => value));
            }
          }}
        />
      </li>
      {sortedUniqueOptions.map((item) => (
        <li key={item.value}>
          <Checkbox
            checked={valueMap.get(item.value) ?? false}
            label={item.label}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                onChange(value.concat(item.value));
              } else {
                onChange(value.filter((alreadySelectedValue) => alreadySelectedValue !== item.value));
              }
            }}
          />
        </li>
      ))}
    </ul>
  );
};
