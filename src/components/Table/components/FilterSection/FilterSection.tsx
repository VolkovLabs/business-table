import { InlineField, RadioButtonGroup, useStyles2 } from '@grafana/ui';
import { Header } from '@tanstack/react-table';
import React, { useEffect, useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';
import { getFilterWithNewType } from '@/utils';

import { FilterFacetedList, FilterNumber, FilterSearch, FilterTime } from './components';
import { getStyles } from './FilterSection.styles';

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
  onClose?: () => void;

  /**
   * Filter
   */
  filter: ColumnFilterValue;

  /**
   * onSave
   */
  onSave?: () => void;

  /**
   * Filter Mode
   */
  filterMode: ColumnFilterMode;

  /**
   * Change handler
   */
  onChange: (value: ColumnFilterValue) => void;

  /**
   * Set Filter
   */
  setFilter: React.Dispatch<React.SetStateAction<ColumnFilterValue>>;

  /**
   * Auto Focus
   *
   * @type {boolean}
   */
  autoFocus: boolean;
}

/**
 * Filter Popup
 */
export const FilterSection = <TData,>({
  onClose,
  header,
  filter,
  onSave,
  onChange,
  setFilter,
  filterMode,
  autoFocus,
}: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

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
          ariaLabel: TEST_IDS.filterSection.typeOption.selector(type),
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
  }, [filter.type, availableTypeOptions, onChange, setFilter]);

  return (
    <div {...TEST_IDS.filterSection.root.apply()}>
      {availableTypeOptions.length > 1 && (
        <>
          <InlineField label="Type">
            <RadioButtonGroup
              options={availableTypeOptions}
              value={filter.type}
              onChange={(event) => {
                onChange(getFilterWithNewType(event));
              }}
            />
          </InlineField>
          {filter.type !== 'none' && <div className={styles.filterPopupLine} />}
        </>
      )}
      {filter.type === ColumnFilterType.SEARCH && (
        <FilterSearch
          value={filter}
          onChange={onChange}
          onSave={onSave}
          onCancel={onClose}
          mode={filterMode}
          autoFocus={autoFocus}
        />
      )}
      {filter.type === ColumnFilterType.FACETED && (
        <FilterFacetedList value={filter} onChange={onChange} header={header} />
      )}
      {filter.type === ColumnFilterType.NUMBER && <FilterNumber value={filter} onChange={onChange} />}
      {filter.type === ColumnFilterType.TIMESTAMP && <FilterTime value={filter} onChange={onChange} />}
    </div>
  );
};
