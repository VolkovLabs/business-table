import { DataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { InlineField, InlineFieldRow, InlineSwitch, Input, Select } from '@grafana/ui';
import React, { useMemo } from 'react';

import { TEST_IDS } from '@/constants';
import { CellAggregation, CellType, ColumnConfig, ColumnFilterMode } from '@/types';
import { getFieldBySource, getSupportedFilterTypesForVariable } from '@/utils';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {ColumnConfig}
   */
  value: ColumnConfig;

  /**
   * Change
   */
  onChange: (value: ColumnConfig) => void;

  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];

  /**
   * Is Aggregation Available
   *
   * @type {boolean}
   */
  isAggregationAvailable: boolean;
}

/**
 * Cell Type Options
 */
const cellTypeOptions = [
  {
    value: CellType.AUTO,
    label: 'Auto',
  },
  {
    value: CellType.COLORED_TEXT,
    label: 'Colored text',
  },
  {
    value: CellType.COLORED_BACKGROUND,
    label: 'Colored background',
  },
];

/**
 * Aggregation Options
 */
const aggregationOptions = [
  {
    value: CellAggregation.COUNT,
    label: 'Count',
  },
  {
    value: CellAggregation.EXTENT,
    label: 'Extent',
  },
  {
    value: CellAggregation.MAX,
    label: 'Max',
  },
  {
    value: CellAggregation.MEAN,
    label: 'Mean',
  },
  {
    value: CellAggregation.MEDIAN,
    label: 'Median',
  },
  {
    value: CellAggregation.MIN,
    label: 'Min',
  },
  {
    value: CellAggregation.NONE,
    label: 'None',
  },
  {
    value: CellAggregation.SUM,
    label: 'Sum',
  },
  {
    value: CellAggregation.UNIQUE,
    label: 'Unique',
  },
  {
    value: CellAggregation.UNIQUE_COUNT,
    label: 'Unique Count',
  },
];

/**
 * Filter Mode Options
 */
const filterModeOptions = [
  {
    value: ColumnFilterMode.CLIENT,
    label: 'Client',
  },
  {
    value: ColumnFilterMode.QUERY,
    label: 'Query',
  },
];

/**
 * Column Editor
 */
export const ColumnEditor: React.FC<Props> = ({ value, onChange, data, isAggregationAvailable }) => {
  /**
   * Current field
   */
  const field = useMemo(() => {
    return getFieldBySource(data, value.field);
  }, [data, value.field]);

  /**
   * Variable Options
   */
  const variableOptions = useMemo(() => {
    if (!value.filter.enabled || value.filter.mode !== ColumnFilterMode.QUERY) {
      return [];
    }

    const variables = getTemplateSrv().getVariables();

    return variables.map((variable) => {
      const supportedFilterTypes = getSupportedFilterTypesForVariable(variable);

      return {
        label: variable.label || variable.name,
        value: variable.name,
        description: supportedFilterTypes.length === 0 ? 'Not supported variable type' : '',
        isDisabled: supportedFilterTypes.length === 0,
      };
    });
  }, [value.filter.enabled, value.filter.mode]);

  return (
    <>
      <InlineField label="Label" grow={true}>
        <Input
          value={value.label}
          placeholder={field?.config.displayName ?? field?.name}
          onChange={(event) =>
            onChange({
              ...value,
              label: event.currentTarget.value,
            })
          }
          {...TEST_IDS.columnEditor.fieldLabel.apply()}
        />
      </InlineField>
      <InlineField label="Type" grow={true}>
        <Select
          options={cellTypeOptions}
          value={value.type}
          onChange={(event) => {
            onChange({
              ...value,
              type: event.value!,
            });
          }}
          {...TEST_IDS.columnEditor.fieldType.apply()}
        />
      </InlineField>
      {value.type === CellType.COLORED_BACKGROUND && (
        <InlineField label="Apply to Row" grow={true}>
          <InlineSwitch
            value={value.appearance.background.applyToRow}
            onChange={(event) =>
              onChange({
                ...value,
                appearance: {
                  ...value.appearance,
                  background: {
                    ...value.appearance.background,
                    applyToRow: event.currentTarget.checked,
                  },
                },
              })
            }
            {...TEST_IDS.columnEditor.fieldAppearanceBackgroundApplyToRow.apply()}
          />
        </InlineField>
      )}
      <InlineFieldRow>
        <InlineField label="Group" grow={true}>
          <InlineSwitch
            value={value.group}
            onChange={(event) =>
              onChange({
                ...value,
                group: event.currentTarget.checked,
              })
            }
            {...TEST_IDS.columnEditor.fieldGroup.apply()}
          />
        </InlineField>
        <InlineField label="Filter" grow={true}>
          <InlineSwitch
            value={value.filter.enabled}
            onChange={(event) =>
              onChange({
                ...value,
                filter: {
                  ...value.filter,
                  enabled: event.currentTarget.checked,
                },
              })
            }
            {...TEST_IDS.columnEditor.fieldFilterEnabled.apply()}
          />
        </InlineField>
        <InlineField label="Sort" grow={true}>
          <InlineSwitch
            value={value.sort.enabled}
            onChange={(event) =>
              onChange({
                ...value,
                sort: {
                  ...value.sort,
                  enabled: event.currentTarget.checked,
                },
              })
            }
            {...TEST_IDS.columnEditor.fieldSortEnabled.apply()}
          />
        </InlineField>
      </InlineFieldRow>

      {!value.group && isAggregationAvailable && (
        <InlineField label="Aggregation" grow={true}>
          <Select
            value={value.aggregation}
            options={aggregationOptions}
            onChange={(event) => {
              onChange({
                ...value,
                aggregation: event.value!,
              });
            }}
            {...TEST_IDS.columnEditor.fieldAggregation.apply()}
          />
        </InlineField>
      )}

      {value.filter.enabled && (
        <InlineFieldRow>
          <InlineField label="Filter Mode">
            <Select
              value={value.filter.mode}
              onChange={(event) => {
                onChange({
                  ...value,
                  filter: {
                    ...value.filter,
                    mode: event.value!,
                  },
                });
              }}
              options={filterModeOptions}
              {...TEST_IDS.columnEditor.fieldFilterMode.apply()}
            />
          </InlineField>
          {value.filter.mode === ColumnFilterMode.QUERY && (
            <InlineField label="Variable" grow={true}>
              <Select
                value={value.filter.variable}
                options={variableOptions}
                onChange={(event) => {
                  onChange({
                    ...value,
                    filter: {
                      ...value.filter,
                      variable: event.value!,
                    },
                  });
                }}
                isClearable={true}
                {...TEST_IDS.columnEditor.fieldFilterVariable.apply()}
              />
            </InlineField>
          )}
        </InlineFieldRow>
      )}
    </>
  );
};
