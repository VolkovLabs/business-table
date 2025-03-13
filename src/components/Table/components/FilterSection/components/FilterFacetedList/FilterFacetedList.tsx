import { getTemplateSrv } from '@grafana/runtime';
import { Checkbox, useStyles2 } from '@grafana/ui';
import { Header } from '@tanstack/react-table';
import React, { useMemo } from 'react';

import { ALL_VALUE_PARAMETER, TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';

import { getStyles } from './FilterFacetedList.styles';

/**
 * Properties
 */
type Value = ColumnFilterValue & { type: ColumnFilterType.FACETED };

interface Props<TData> {
  /**
   * Header
   */
  header: Header<TData, unknown>;

  /**
   * Change
   */
  onChange: (value: Value) => void;

  /**
   * Value
   *
   * @type {Value}
   */
  value: Value;
}

/**
 * Filter Faceted List
 */
export const FilterFacetedList = <TData,>({ header: { column }, value: filterValue, onChange }: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Selected values as map to check selection state
   */
  const valueMap = useMemo(() => {
    return filterValue.value.reduce((acc, item) => {
      acc.set(item, true);
      return acc;
    }, new Map<string, boolean>());
  }, [filterValue.value]);

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
    <ul className={styles.filterFacetedList} {...TEST_IDS.filterFacetedList.root.apply()}>
      <li>
        <Checkbox
          checked={filterValue.value.length === sortedUniqueOptions.length}
          indeterminate={filterValue.value.length > 0 && sortedUniqueOptions.length > filterValue.value.length}
          label="All"
          onChange={() => {
            if (filterValue.value.length === sortedUniqueOptions.length) {
              onChange({
                ...filterValue,
                value: [],
              });
            } else {
              onChange({
                ...filterValue,
                value: sortedUniqueOptions.map(({ value }) => value),
              });
            }
          }}
          {...TEST_IDS.filterFacetedList.allOption.apply()}
        />
      </li>
      {sortedUniqueOptions.map((item) => (
        <li key={item.value}>
          <Checkbox
            checked={valueMap.get(item.value) ?? false}
            label={item.label}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                onChange({
                  ...filterValue,
                  value: filterValue.value.concat(item.value),
                });
              } else {
                onChange({
                  ...filterValue,
                  value: filterValue.value.filter((alreadySelectedValue) => alreadySelectedValue !== item.value),
                });
              }
            }}
            {...TEST_IDS.filterFacetedList.option.apply(item.value)}
          />
        </li>
      ))}
    </ul>
  );
};
