import { locationService } from '@grafana/runtime';
import { Button, useStyles2 } from '@grafana/ui';
import { Header } from '@tanstack/react-table';
import React, { useCallback, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterValue } from '@/types';
import { getVariableKeyForLocation, saveWithCorrectFilters } from '@/utils';

import { FilterSection } from '../FilterSection';
import { getStyles } from './FilterDrawer.styles';

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Header
   */
  header: Header<TData, unknown>;

  /**
   * Update Preferences
   */
  updatePreferencesWithFilters: (columnName: string, filter?: ColumnFilterValue) => void;
}

/**
 * Filter Popup
 */
export const FilterDrawer = <TData,>({ header, updatePreferencesWithFilters }: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Search Value
   */
  const [filter, setFilter] = useState(
    (header?.column.getFilterValue() as ColumnFilterValue) || {
      type: 'none',
    }
  );

  /**
   * Filter Mode
   */
  const filterMode = header?.column.columnDef.meta?.filterMode || ColumnFilterMode.CLIENT;

  /**
   * Set value
   */
  const onSetValue = useCallback(
    (filterValue?: ColumnFilterValue) => {
      header?.column.setFilterValue(filterValue);

      /**
       * Update variable if query mode
       */
      if (filterMode === ColumnFilterMode.QUERY) {
        let varValue = null;

        if (filterValue && 'value' in filterValue) {
          varValue = filterValue.value;
        }

        locationService.partial(
          {
            [getVariableKeyForLocation(header?.column.columnDef.meta?.filterVariableName ?? '')]: varValue,
          },
          true
        );
      }
    },
    [filterMode, header?.column]
  );

  /**
   * Save
   */
  const onSave = useCallback(
    (filterValue: ColumnFilterValue) => {
      onSetValue(saveWithCorrectFilters(filterValue));
    },
    [onSetValue]
  );

  /**
   * Clear
   */
  const onClear = useCallback(() => {
    onSetValue(undefined);
  }, [onSetValue]);

  return (
    <div className={styles.filterDrawer} {...TEST_IDS.filterDrawer.root.apply()}>
      <FilterSection
        autoFocus={false}
        header={header}
        // @ts-ignore
        filter={filter}
        setFilter={setFilter}
        onChange={(value: ColumnFilterValue) => {
          setFilter(value);
          onSave(value);
          updatePreferencesWithFilters(header.id, saveWithCorrectFilters(value));
        }}
        filterMode={filterMode}
      />

      <div className={styles.filterPopupLine} />
      <div className={styles.filterPopupFooter}>
        <Button
          variant="primary"
          size="sm"
          fill="text"
          onClick={() => {
            onClear();
            setFilter({
              type: 'none',
            });
            updatePreferencesWithFilters(header.id, undefined);
          }}
          {...TEST_IDS.filterDrawer.buttonClear.apply()}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};
