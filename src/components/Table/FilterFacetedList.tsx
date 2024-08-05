import { Checkbox, useStyles2 } from '@grafana/ui';
import { Header } from '@tanstack/react-table';
import React, { useMemo } from 'react';

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
   * Sorted Unique Values
   */
  const sortedUniqueValues = useMemo(
    () => Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000),
    [column]
  );

  return (
    <ul className={styles.filterFacetedList}>
      <li>
        <Checkbox
          checked={value.length === sortedUniqueValues.length}
          indeterminate={value.length > 0 && sortedUniqueValues.length > value.length}
          label="All"
          onChange={() => {
            if (value.length === sortedUniqueValues.length) {
              onChange([]);
            } else {
              onChange(sortedUniqueValues);
            }
          }}
        />
      </li>
      {sortedUniqueValues.map((item) => (
        <li key={item}>
          <Checkbox
            checked={valueMap.get(item) ?? false}
            label={item}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                onChange(value.concat(item));
              } else {
                onChange(value.filter((alreadySelectedValue) => alreadySelectedValue !== item));
              }
            }}
          />
        </li>
      ))}
    </ul>
  );
};
