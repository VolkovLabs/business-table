import { DataFrame, standardEditorsRegistry } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { InlineField, InlineFieldRow, InlineSwitch, Input, RadioButtonGroup, Select } from '@grafana/ui';
import { NumberInput } from '@volkovlabs/components';
import React, { useMemo } from 'react';

import { FieldsGroup } from '@/components';
import { TEST_IDS } from '@/constants';
import {
  CellAggregation,
  CellType,
  ColumnAlignment,
  ColumnConfig,
  ColumnFilterMode,
  ColumnPinDirection,
} from '@/types';
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
 * Column Pin Direction Options
 */
const columnPinDirectionOptions = [
  {
    value: ColumnPinDirection.LEFT,
    label: '',
    icon: 'align-left',
    description: 'Pinned to the left',
    ariaLabel: TEST_IDS.columnEditor.pinDirectionOption.selector(ColumnPinDirection.LEFT),
  },
  {
    value: ColumnPinDirection.NONE,
    label: 'None',
    ariaLabel: TEST_IDS.columnEditor.pinDirectionOption.selector(ColumnPinDirection.NONE),
  },
  {
    value: ColumnPinDirection.RIGHT,
    label: '',
    icon: 'align-right',
    description: 'Pinned to the right',
    ariaLabel: TEST_IDS.columnEditor.pinDirectionOption.selector(ColumnPinDirection.RIGHT),
  },
];

/**
 * Sort Direction Options
 */
const sortDirectionOptions = [
  {
    value: false,
    label: 'A-Z',
    icon: 'sort-amount-up',
    description: 'Ascending order',
    ariaLabel: TEST_IDS.columnEditor.sortDirectionOption.selector('asc'),
  },
  {
    value: true,
    label: 'Z-A',
    icon: 'sort-amount-down',
    description: 'Descending order',
    ariaLabel: TEST_IDS.columnEditor.sortDirectionOption.selector('desc'),
  },
];

/**
 * Column Footer Editor
 */
const ColumnFooterEditor = standardEditorsRegistry.get('stats-picker').editor;

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
      <FieldsGroup label="Format">
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
      </FieldsGroup>
      <FieldsGroup label="Size">
        <InlineFieldRow>
          <InlineField label="Auto Width">
            <InlineSwitch
              value={value.appearance.width.auto}
              onChange={(event) =>
                onChange({
                  ...value,
                  appearance: {
                    ...value.appearance,
                    width: {
                      ...value.appearance.width,
                      auto: event.currentTarget.checked,
                    },
                  },
                })
              }
              {...TEST_IDS.columnEditor.fieldAppearanceWidthAuto.apply()}
            />
          </InlineField>
          {value.appearance.width.auto ? (
            <>
              <InlineField label="Min">
                <NumberInput
                  value={value.appearance.width.min ?? 0}
                  onChange={(min) => {
                    onChange({
                      ...value,
                      appearance: {
                        ...value.appearance,
                        width: {
                          ...value.appearance.width,
                          min,
                        },
                      },
                    });
                  }}
                  {...TEST_IDS.columnEditor.fieldAppearanceWidthMin.apply()}
                />
              </InlineField>
              <InlineField label="Max">
                <NumberInput
                  value={value.appearance.width.max ?? 0}
                  placeholder="Auto"
                  onChange={(max) => {
                    onChange({
                      ...value,
                      appearance: {
                        ...value.appearance,
                        width: {
                          ...value.appearance.width,
                          max: max || undefined,
                        },
                      },
                    });
                  }}
                  {...TEST_IDS.columnEditor.fieldAppearanceWidthMax.apply()}
                />
              </InlineField>
            </>
          ) : (
            <InlineField label="Width">
              <NumberInput
                value={value.appearance.width.value}
                placeholder="Auto"
                onChange={(width) => {
                  onChange({
                    ...value,
                    appearance: {
                      ...value.appearance,
                      width: {
                        ...value.appearance.width,
                        value: width,
                      },
                    },
                  });
                }}
                {...TEST_IDS.columnEditor.fieldAppearanceWidthValue.apply()}
              />
            </InlineField>
          )}
        </InlineFieldRow>
      </FieldsGroup>
      <FieldsGroup label="Text">
        <InlineFieldRow>
          <InlineField label="Wrap">
            <InlineSwitch
              value={value.appearance.wrap}
              onChange={(event) =>
                onChange({
                  ...value,
                  appearance: {
                    ...value.appearance,
                    wrap: event.currentTarget.checked,
                  },
                })
              }
              {...TEST_IDS.columnEditor.fieldAppearanceWrap.apply()}
            />
          </InlineField>
          <InlineField label="Alignment" {...TEST_IDS.columnEditor.fieldAppearanceAlignment.apply()}>
            <RadioButtonGroup
              value={value.appearance.alignment}
              onChange={(event) =>
                onChange({
                  ...value,
                  appearance: {
                    ...value.appearance,
                    alignment: event,
                  },
                })
              }
              options={[
                {
                  value: ColumnAlignment.START,
                  icon: 'align-left',
                  description: 'Start',
                  ariaLabel: TEST_IDS.columnEditor.fieldAppearanceAlignmentOption.selector(ColumnAlignment.START),
                },
                {
                  value: ColumnAlignment.CENTER,
                  icon: 'bars',
                  description: 'Center',
                  ariaLabel: TEST_IDS.columnEditor.fieldAppearanceAlignmentOption.selector(ColumnAlignment.CENTER),
                },
                {
                  value: ColumnAlignment.END,
                  icon: 'align-right',
                  description: 'End',
                  ariaLabel: TEST_IDS.columnEditor.fieldAppearanceAlignmentOption.selector(ColumnAlignment.END),
                },
              ]}
            />
          </InlineField>
        </InlineFieldRow>
      </FieldsGroup>
      <FieldsGroup label="Position">
        <InlineField label="Pin" grow={true} {...TEST_IDS.columnEditor.fieldPinDirection.apply()}>
          <RadioButtonGroup
            value={value.pin}
            onChange={(event) =>
              onChange({
                ...value,
                pin: event,
              })
            }
            options={columnPinDirectionOptions}
          />
        </InlineField>
      </FieldsGroup>
      <FieldsGroup label="Data Settings">
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
      </FieldsGroup>

      {value.sort.enabled && (
        <FieldsGroup label="Sort">
          <InlineField label="First Direction" grow={true} {...TEST_IDS.columnEditor.fieldSortDirection.apply()}>
            <RadioButtonGroup
              value={value.sort.descFirst}
              onChange={(event) =>
                onChange({
                  ...value,
                  sort: {
                    ...value.sort,
                    descFirst: event,
                  },
                })
              }
              options={sortDirectionOptions}
            />
          </InlineField>
        </FieldsGroup>
      )}

      {value.filter.enabled && (
        <FieldsGroup label="Filter">
          <InlineFieldRow>
            <InlineField label="Mode">
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
        </FieldsGroup>
      )}

      <FieldsGroup label="Footer">
        <InlineField label="Show" grow={true}>
          <ColumnFooterEditor
            value={value.footer}
            onChange={(footer) => {
              onChange({
                ...value,
                footer,
              });
            }}
            context={{} as never}
            item={{ id: 'columnFooterEditor', name: 'columnFooterEditor' }}
          />
        </InlineField>
      </FieldsGroup>
    </>
  );
};
