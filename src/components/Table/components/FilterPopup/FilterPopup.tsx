import { locationService } from '@grafana/runtime';
import { Button, ClickOutsideWrapper, InlineField, RadioButtonGroup, useStyles2 } from '@grafana/ui';
import { Header } from '@tanstack/react-table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';
import { getFilterWithNewType } from '@/utils';

import { FilterFacetedList, FilterNumber, FilterSearch, FilterTime } from './components';
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

  /**
   * Available Type Options
   */
  const availableTypeOptions = useMemo(() => {
    if (header.column.columnDef.meta?.availableFilterTypes) {
      const types = header.column.columnDef.meta.availableFilterTypes;

      return types.map((type) => {
        let label = 'Unknown';

        switch (type) {
          case ColumnFilterType.FACETED: {
            label = 'Options';
            break;
          }
          case ColumnFilterType.NUMBER: {
            label = 'Range';
            break;
          }
          case ColumnFilterType.SEARCH: {
            label = 'Search';
            break;
          }
          case ColumnFilterType.TIMESTAMP: {
            label = 'Time';
            break;
          }
        }

        return {
          label,
          value: type,
          ariaLabel: TEST_IDS.filterPopup.typeOption.selector(type),
        };
      });
    }
    return [];
  }, [header]);

  /**
   * Preselect first type
   */
  useEffect(() => {
    if (filter.type === 'none' && availableTypeOptions.length > 0) {
      setFilter(getFilterWithNewType(availableTypeOptions[0].value));
    }
  }, [filter.type, availableTypeOptions]);

  return (
    <ClickOutsideWrapper onClick={onClose} useCapture={true}>
      <div
        className={styles.filterPopup}
        onClick={(event) => event.stopPropagation()}
        {...TEST_IDS.filterPopup.root.apply()}
      >
        {availableTypeOptions.length > 1 && (
          <>
            <InlineField label="Type">
              <RadioButtonGroup
                options={availableTypeOptions}
                value={filter.type}
                onChange={(event) => {
                  setFilter(getFilterWithNewType(event));
                }}
              />
            </InlineField>
            {filter.type !== 'none' && <div className={styles.filterPopupLine} />}
          </>
        )}
        {filter.type === ColumnFilterType.SEARCH && (
          <FilterSearch value={filter} onChange={setFilter} onSave={onSave} onCancel={onClose} mode={filterMode} />
        )}
        {filter.type === ColumnFilterType.FACETED && (
          <FilterFacetedList value={filter} onChange={setFilter} header={header} />
        )}
        {filter.type === ColumnFilterType.NUMBER && <FilterNumber value={filter} onChange={setFilter} />}
        {filter.type === ColumnFilterType.TIMESTAMP && <FilterTime value={filter} onChange={setFilter} />}
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
