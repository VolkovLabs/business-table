import { locationService } from '@grafana/runtime';
import {
  Button,
  ButtonSelect,
  ClickOutsideWrapper,
  InlineField,
  InlineFieldRow,
  Input,
  RadioButtonGroup,
  useStyles2,
} from '@grafana/ui';
import { Header } from '@tanstack/react-table';
import { NumberInput } from '@volkovlabs/components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue, NumberFilterOperator } from '../../types';
import { getFilterWithNewType } from '../../utils';
import { FilterFacetedList } from './FilterFacetedList';
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
        let label = '';

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
          default: {
            label = 'Unknown';
          }
        }

        return {
          label,
          value: type,
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
      <div className={styles.filterPopup} onClick={(event) => event.stopPropagation()}>
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
          <>
            <InlineField label="Search">
              <Input
                placeholder="Search term"
                value={filter.value}
                onChange={(event) => {
                  setFilter({
                    ...filter,
                    value: event.currentTarget.value,
                  });
                }}
                autoFocus={true}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    onSave();
                    return;
                  }

                  if (event.key === 'Escape') {
                    onClose();
                    return;
                  }
                }}
                addonAfter={
                  filterMode === ColumnFilterMode.CLIENT && (
                    <Button
                      variant={filter.caseSensitive ? 'primary' : 'secondary'}
                      fill="outline"
                      icon="text-fields"
                      onClick={() => {
                        setFilter({
                          ...filter,
                          caseSensitive: !filter.caseSensitive,
                        });
                      }}
                      tooltip="Match Case"
                    />
                  )
                }
              />
            </InlineField>
          </>
        )}
        {filter.type === ColumnFilterType.FACETED && (
          <FilterFacetedList
            value={filter.value}
            onChange={(value) => {
              setFilter({
                ...filter,
                value,
              });
            }}
            header={header}
          />
        )}
        {filter.type === ColumnFilterType.NUMBER && (
          <InlineFieldRow>
            <ButtonSelect
              options={Object.values(NumberFilterOperator).map((operator) => ({
                label: operator,
                value: operator,
              }))}
              onChange={(item) => {
                setFilter({
                  ...filter,
                  operator: item.value!,
                });
              }}
              value={{ value: filter.operator }}
            />
            <InlineField>
              <NumberInput
                value={filter.value[0]}
                onChange={(value) => {
                  setFilter({
                    ...filter,
                    value: [value, filter.value[1]],
                  });
                }}
                width={8}
              />
            </InlineField>
            {filter.operator === NumberFilterOperator.BETWEEN && (
              <InlineField label="and" transparent={true}>
                <NumberInput
                  value={filter.value[1]}
                  onChange={(value) => {
                    setFilter({
                      ...filter,
                      value: [filter.value[0], value],
                    });
                  }}
                  width={8}
                />
              </InlineField>
            )}
          </InlineFieldRow>
        )}
        <div className={styles.filterPopupLine} />
        <div className={styles.filterPopupFooter}>
          <Button variant="primary" size="sm" fill="text" onClick={onClear}>
            Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    </ClickOutsideWrapper>
  );
};
