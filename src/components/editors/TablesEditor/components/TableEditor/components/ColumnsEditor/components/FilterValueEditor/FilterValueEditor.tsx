import { DataFrame, FieldType } from '@grafana/data';
import { Button, InlineField, RadioButtonGroup, useStyles2 } from '@grafana/ui';
import React, { useEffect, useMemo, useState } from 'react';

import { FilterNumber, FilterSearch, FilterTime } from '@/components/Table/components/FilterSection/components';
import { TEST_IDS } from '@/constants';
import { ColumnConfig, ColumnFilterMode, ColumnFilterType, ColumnFilterValue, EditorProps } from '@/types';
import { getFieldBySource, getFilterWithNewType } from '@/utils';

import { FilterDefaultFacetedList } from '../FilterDefaultFacetedList';
import { getStyles } from './FilterValueEditor.styles';

/**
 * Properties
 */
interface Props extends EditorProps<ColumnConfig> {
  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];
}

/**
 * Filter Value Editor
 */
export const FilterValueEditor: React.FC<Props> = ({ value, onChange, data }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Filter Value
   */
  const [defaultFilterValue, setDefaultFilterValue] = useState(
    value.filter.defaultClientValue ||
      ({
        type: 'none',
      } as ColumnFilterValue)
  );

  /**
   * Current field
   */
  const field = useMemo(() => {
    return getFieldBySource(data, value.field);
  }, [data, value.field]);

  /**
   * Available filter types
   */
  const availableFilterTypes = useMemo(() => {
    const filterTypes: ColumnFilterType[] = [];
    if (field) {
      switch (field.type) {
        case FieldType.string: {
          filterTypes.push(...[ColumnFilterType.SEARCH, ColumnFilterType.FACETED]);
          break;
        }
        case FieldType.number: {
          filterTypes.push(...[ColumnFilterType.NUMBER]);
          break;
        }
        case FieldType.time: {
          filterTypes.push(...[ColumnFilterType.TIMESTAMP]);
          break;
        }
        default: {
          filterTypes.push(...[ColumnFilterType.SEARCH, ColumnFilterType.FACETED]);
        }
      }
    }
    return filterTypes;
  }, [field]);

  /**
   * Available Type Options
   */
  const availableTypeOptions = useMemo(() => {
    if (availableFilterTypes && availableFilterTypes.length) {
      const types = availableFilterTypes;

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
          ariaLabel: TEST_IDS.filterValueEditor.typeOption.selector(type),
        };
      });
    }
    return [];
  }, [availableFilterTypes]);

  /**
   * Preselect first type
   */
  useEffect(() => {
    if (defaultFilterValue.type === 'none' && availableTypeOptions.length > 0) {
      setDefaultFilterValue(getFilterWithNewType(availableTypeOptions[0].value));
    }
  }, [availableTypeOptions, defaultFilterValue.type]);

  return (
    <div className={styles.container} {...TEST_IDS.filterValueEditor.root.apply()}>
      <InlineField label="Default value" grow={true}>
        <div>
          {availableTypeOptions.length > 1 && (
            <>
              <InlineField label="Type" {...TEST_IDS.filterValueEditor.fieldType.apply()}>
                <RadioButtonGroup
                  options={availableTypeOptions}
                  value={defaultFilterValue.type}
                  onChange={(event) => {
                    const newFilterType = getFilterWithNewType(event);
                    setDefaultFilterValue(newFilterType);
                  }}
                />
              </InlineField>
              {defaultFilterValue.type !== 'none' && (
                <div
                  style={{
                    borderTop: '1px solid grey',
                    margin: '8px',
                  }}
                />
              )}
            </>
          )}
          {defaultFilterValue.type === ColumnFilterType.SEARCH && (
            <FilterSearch
              value={defaultFilterValue}
              onChange={(value) => {
                setDefaultFilterValue(value);
              }}
              mode={ColumnFilterMode.CLIENT}
              autoFocus={false}
            />
          )}
          {defaultFilterValue.type === ColumnFilterType.FACETED && (
            <FilterDefaultFacetedList
              filterValue={defaultFilterValue}
              onChange={(value) => {
                setDefaultFilterValue(value);
              }}
              field={field}
            />
          )}
          {defaultFilterValue.type === ColumnFilterType.NUMBER && (
            <FilterNumber
              value={defaultFilterValue}
              onChange={(value) => {
                setDefaultFilterValue(value);
              }}
            />
          )}
          {defaultFilterValue.type === ColumnFilterType.TIMESTAMP && (
            <FilterTime
              value={defaultFilterValue}
              onChange={(value) => {
                setDefaultFilterValue(value);
              }}
            />
          )}
          <div>
            <Button
              variant="primary"
              size="sm"
              fill="text"
              onClick={() => {
                onChange({
                  ...value,
                  filter: {
                    ...value.filter,
                    defaultClientValue: undefined,
                  },
                });
                setDefaultFilterValue({
                  type: 'none',
                } as ColumnFilterValue);
              }}
              {...TEST_IDS.filterValueEditor.buttonClear.apply()}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onChange({
                  ...value,
                  filter: {
                    ...value.filter,
                    defaultClientValue: defaultFilterValue,
                  },
                });
              }}
              {...TEST_IDS.filterValueEditor.buttonSave.apply()}
            >
              Save
            </Button>
          </div>
        </div>
      </InlineField>
    </div>
  );
};
