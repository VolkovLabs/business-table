import { locationService } from '@grafana/runtime';
import { Button, ClickOutsideWrapper, useStyles2 } from '@grafana/ui';
import { Header } from '@tanstack/react-table';
import React, { useCallback, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';

import { FilterSection } from '../FilterSection';
import { getStyles } from './FilterPopup.styles';

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Header
   */
  header: Header<TData, unknown>;

  /**
   * Close
   */
  onClose: () => void;
}

/**
 * Filter Popup
 */
export const FilterPopup = <TData,>({ onClose, header }: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Search Value
   */
  const [filter, setFilter] = useState(
    (header.column.getFilterValue() as ColumnFilterValue) || {
      type: 'none',
    }
  );

  /**
   * Filter Mode
   */
  const filterMode = header.column.columnDef.meta?.filterMode || ColumnFilterMode.CLIENT;

  /**
   * Set value
   */
  const onSetValue = useCallback(
    (filterValue?: ColumnFilterValue) => {
      header.column.setFilterValue(filterValue);

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
            [`var-${header.column.columnDef.meta?.filterVariableName}`]: varValue,
          },
          true
        );
      }
    },
    [filterMode, header.column]
  );

  /**
   * Save
   */
  const onSave = useCallback(() => {
    let filterValueToSave: ColumnFilterValue | undefined = undefined;

    switch (filter.type) {
      case ColumnFilterType.SEARCH: {
        if (filter.value) {
          filterValueToSave = filter;
        }
        break;
      }
      case ColumnFilterType.FACETED: {
        if (filter.value.length) {
          filterValueToSave = filter;
        }
        break;
      }
      case ColumnFilterType.NUMBER: {
        filterValueToSave = filter;
        break;
      }
      case ColumnFilterType.TIMESTAMP: {
        if (filter.value.from.isValid() && filter.value.to.isValid()) {
          filterValueToSave = filter;
        }
        break;
      }
    }

    onSetValue(filterValueToSave);
    onClose();
  }, [filter, onSetValue, onClose]);

  /**
   * Clear
   */
  const onClear = useCallback(() => {
    onSetValue(undefined);
    onClose();
  }, [onSetValue, onClose]);

  return (
    <ClickOutsideWrapper onClick={onClose} useCapture={true}>
      <div
        className={styles.filterPopup}
        onClick={(event) => event.stopPropagation()}
        {...TEST_IDS.filterPopup.root.apply()}
      >
        <FilterSection
          onClose={onClose}
          header={header}
          autoFocus={true}
          setFilter={setFilter}
          filter={filter}
          onChange={(value) => setFilter(value)}
          onSave={onSave}
          filterMode={filterMode}
        />
        <div className={styles.filterPopupLine} />
        <div className={styles.filterPopupFooter}>
          <Button
            variant="primary"
            size="sm"
            fill="text"
            onClick={onClear}
            {...TEST_IDS.filterPopup.buttonClear.apply()}
          >
            Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose} {...TEST_IDS.filterPopup.buttonCancel.apply()}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} {...TEST_IDS.filterPopup.buttonSave.apply()}>
            Save
          </Button>
        </div>
      </div>
    </ClickOutsideWrapper>
  );
};
