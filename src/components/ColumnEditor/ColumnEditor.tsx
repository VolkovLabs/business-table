import { DataFrame, OrgRole, standardEditorsRegistry } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { InlineField, InlineFieldRow, InlineSwitch, Input, RadioButtonGroup, Select, useStyles2 } from '@grafana/ui';
import { CollapsableSection, NumberInput } from '@volkovlabs/components';
import React, { useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import {
  CellAggregation,
  CellType,
  ColumnAlignment,
  ColumnConfig,
  ColumnFilterMode,
  EditPermissionMode,
} from '@/types';
import { getFieldBySource, getSupportedFilterTypesForVariable } from '@/utils';

import { getStyles } from './ColumnEditor.styles';

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
 * Edit Permission Mode Options
 */
const editPermissionModeOptions = [
  {
    value: EditPermissionMode.ALLOWED,
    label: 'Always Allowed',
  },
  {
    value: EditPermissionMode.USER_ROLE,
    label: 'By Org User Role',
  },
  {
    value: EditPermissionMode.QUERY,
    label: 'By Backend',
    isDisabled: true,
    description: 'Not supported yet',
  },
];

/**
 * User Org Role Options
 */
const userOrgRoleOptions = Object.values(OrgRole).map((role) => ({
  value: role,
  label: role,
}));

/**
 * Column Footer Editor
 */
const ColumnFooterEditor = standardEditorsRegistry.get('stats-picker').editor;

/**
 * Column Editor
 */
export const ColumnEditor: React.FC<Props> = ({ value, onChange, data, isAggregationAvailable }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Editable Section Expanded
   */
  const [isEditableSectionExpanded, setIsEditableSectionExpanded] = useState(false);

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
      <InlineFieldRow>
        <InlineField label="Wrap Text">
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
      <InlineField label="Show in Footer" grow={true}>
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
      <InlineField label="Editable">
        <InlineSwitch
          value={value.edit.enabled}
          onChange={(event) => {
            onChange({
              ...value,
              edit: {
                ...value.edit,
                enabled: event.currentTarget.checked,
              },
            });
          }}
        />
      </InlineField>
      {value.edit.enabled && (
        <CollapsableSection
          label="Editable Settings"
          isOpen={isEditableSectionExpanded}
          onToggle={setIsEditableSectionExpanded}
          contentClassName={styles.editSettingsSectionContent}
        >
          <InlineField label="Permission Check" grow={true}>
            <Select
              value={value.edit.permission.mode}
              onChange={(event) => {
                onChange({
                  ...value,
                  edit: {
                    ...value.edit,
                    permission: {
                      ...value.edit.permission,
                      mode: event.value!,
                    },
                  },
                });
              }}
              options={editPermissionModeOptions}
            />
          </InlineField>
          {value.edit.permission.mode === EditPermissionMode.USER_ROLE && (
            <InlineField label="User Role" grow={true}>
              <Select
                value={value.edit.permission.userRole}
                onChange={(event) => {
                  const values = Array.isArray(event) ? event : [event];

                  onChange({
                    ...value,
                    edit: {
                      ...value.edit,
                      permission: {
                        ...value.edit.permission,
                        userRole: values.map((item) => item.value),
                      },
                    },
                  });
                }}
                options={userOrgRoleOptions}
                isMulti={true}
                isClearable={true}
                allowCustomValue={true}
                placeholder="Allowed Org User Role"
              />
            </InlineField>
          )}
        </CollapsableSection>
      )}
    </>
  );
};
