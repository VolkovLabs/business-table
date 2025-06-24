import { Field } from '@grafana/data';
import { Checkbox, useStyles2 } from '@grafana/ui';
import React, { useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterType, ColumnFilterValue } from '@/types';

import { getStyles } from './FilterDefaultFacetedList.styles';

/**
 * Properties
 */
type Value = ColumnFilterValue & { type: ColumnFilterType.FACETED };

/**
 * Properties
 */
interface Props {
  /**
   * Field
   *
   * @type {DataFrame[]}
   */
  field?: Field;

  /**
   * Filter Value
   */
  filterValue: Value;

  /**
   * Set Filter
   */
  onChange: (value: ColumnFilterValue) => void;
}

/**
 * Filter Faceted List
 */
export const FilterDefaultFacetedList: React.FC<Props> = ({ field, filterValue, onChange }) => {
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
     * Get options based on column values
     */
    const values = field?.values || [];

    return values.map((value) => ({
      value,
      label: value,
    }));
  }, [field?.values]);

  return (
    <ul className={styles.filterFacetedList} {...TEST_IDS.filterDefaultFacetedList.root.apply()}>
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
          {...TEST_IDS.filterDefaultFacetedList.allOption.apply()}
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
            {...TEST_IDS.filterDefaultFacetedList.option.apply(item.value)}
          />
        </li>
      ))}
    </ul>
  );
};
