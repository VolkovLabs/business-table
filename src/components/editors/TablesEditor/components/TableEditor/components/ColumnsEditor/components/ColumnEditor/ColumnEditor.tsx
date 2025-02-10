import { DataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { BarGaugeDisplayMode, BarGaugeValueMode } from '@grafana/schema';
import { InlineField, InlineFieldRow, InlineSwitch, Input, RadioButtonGroup, Select, StatsPicker } from '@grafana/ui';
import { NumberInput, Slider } from '@volkovlabs/components';
import React, { useMemo, useState } from 'react';

import { FieldsGroup } from '@/components';
import { ColorEditor } from '@/components/editors';
import { DEFAULT_SHOWING_ROWS, GAUGE_DEFAULT_VALUE_SIZE, TEST_IDS } from '@/constants';
import { tablesEditorContext } from '@/hooks';
import {
  CellAggregation,
  CellType,
  ColumnAlignment,
  ColumnConfig,
  ColumnFilterMode,
  ColumnHeaderFontSize,
  ColumnPinDirection,
  EditorProps,
  ImageScale,
} from '@/types';
import {
  cleanPayloadObject,
  getColumnConfigWithNewType,
  getFieldBySource,
  getSupportedFilterTypesForVariable,
} from '@/utils';

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

  /**
   * Is Aggregation Available
   *
   * @type {boolean}
   */
  isAggregationAvailable: boolean;

  /**
   * Show Table Header
   *
   * @type {boolean}
   */
  showTableHeader: boolean;
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
    value: CellType.BOOLEAN,
    label: 'Boolean',
  },
  {
    value: CellType.COLORED_BACKGROUND,
    label: 'Colored background',
    description: 'Uses defined thresholds',
  },
  {
    value: CellType.COLORED_TEXT,
    label: 'Colored text',
    description: 'Uses defined thresholds',
  },
  {
    value: CellType.IMAGE,
    label: 'Image',
    description: 'Base64 encoded data and URL',
  },
  {
    value: CellType.GAUGE,
    label: 'Gauge',
  },
  {
    value: CellType.JSON,
    label: 'JSON',
  },
  {
    value: CellType.NESTED_OBJECTS,
    label: 'Nested objects',
    description: 'Column value should be an array of object ids',
  },
  {
    value: CellType.PREFORMATTED,
    label: 'Preformatted',
    description: 'Text preserves both spaces and line breaks',
  },
  {
    value: CellType.RICH_TEXT,
    label: 'Rich text',
    description: 'HTML / Markdown',
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
 * Aggregation Options for group
 */
const aggregationOptionsForGroup = [
  {
    value: CellAggregation.COUNT,
    label: 'Count',
    description: 'Show sub rows total',
  },
  {
    value: CellAggregation.NONE,
    label: 'None',
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
 * Image Scale Options
 */
const imageScaleOptions = [
  { value: ImageScale.AUTO, label: 'Auto' },
  {
    value: ImageScale.CRISP_EDGES,
    label: 'Crisp Edges',
    description:
      'The image is scaled with an algorithm that preserves contrast and edges in the image. Generally intended for images such as pixel art or line drawings, no blurring or color smoothing occurs.',
  },
  {
    value: ImageScale.PIXELATED,
    label: 'Pixelated',
    description:
      'The image is scaled with the "nearest neighbor" or similar algorithm, preserving a "pixelated" look as the image changes in size.',
  },
];

/**
 * Column Editor
 */
export const ColumnEditor: React.FC<Props> = ({ value, onChange, data, isAggregationAvailable, showTableHeader }) => {
  /**
   * State
   */
  const [gaugeValueSize, setGaugeValueSize] = useState(value.gauge?.valueSize ?? GAUGE_DEFAULT_VALUE_SIZE);
  const [showingRows, setShowingRows] = useState(value.showingRows ?? DEFAULT_SHOWING_ROWS);

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

  /**
   * Nested Object Options
   */
  const { nestedObjects } = tablesEditorContext.useContext();
  const nestedObjectOptions = useMemo(() => {
    return nestedObjects.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [nestedObjects]);

  return (
    <>
      <FieldsGroup label="Format">
        <InlineField label="Type" grow={true}>
          <Select
            options={cellTypeOptions}
            value={value.type}
            onChange={(event) => {
              onChange(getColumnConfigWithNewType(value, event.value!));
            }}
            {...TEST_IDS.columnEditor.fieldType.apply()}
          />
        </InlineField>
        {value.type === CellType.JSON && (
          <InlineField
            label="Show rows"
            grow={true}
            tooltip="Number of rows displayed in the cell. The rest will be hidden."
          >
            <Slider
              value={showingRows}
              min={0}
              max={100}
              step={1}
              included={true}
              marks={{
                0: '0',
                25: '25',
                50: '50',
                75: '75',
                100: '100',
              }}
              onChange={(rows) => {
                setShowingRows(rows);
              }}
              onAfterChange={(rows) => {
                onChange({
                  ...value,
                  showingRows: rows!,
                });
              }}
              {...TEST_IDS.columnEditor.fieldShowingRows.apply()}
            />
          </InlineField>
        )}
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
        {value.type === CellType.GAUGE && (
          <FieldsGroup label="Gauge settings">
            <InlineField label="Display mode" {...TEST_IDS.columnEditor.fieldGaugeDisplayMode.apply()}>
              <RadioButtonGroup
                value={value.gauge.mode}
                onChange={(event) =>
                  onChange({
                    ...value,
                    gauge: {
                      ...value.gauge,
                      mode: event,
                    },
                  })
                }
                options={[
                  {
                    value: BarGaugeDisplayMode.Basic,
                    label: 'Basic',
                    ariaLabel: TEST_IDS.columnEditor.fieldGaugeDisplayModeOption.selector(BarGaugeDisplayMode.Basic),
                  },
                  {
                    value: BarGaugeDisplayMode.Gradient,
                    label: 'Gradient',
                    ariaLabel: TEST_IDS.columnEditor.fieldGaugeDisplayModeOption.selector(BarGaugeDisplayMode.Gradient),
                  },
                  {
                    value: BarGaugeDisplayMode.Lcd,
                    label: 'LCD',
                    ariaLabel: TEST_IDS.columnEditor.fieldGaugeDisplayModeOption.selector(BarGaugeDisplayMode.Lcd),
                  },
                ]}
              />
            </InlineField>
            <InlineField label="Value display" {...TEST_IDS.columnEditor.fieldGaugeValueDisplay.apply()}>
              <RadioButtonGroup
                value={value.gauge.valueDisplayMode}
                onChange={(event) =>
                  onChange({
                    ...value,
                    gauge: {
                      ...value.gauge,
                      valueDisplayMode: event,
                    },
                  })
                }
                options={[
                  {
                    value: BarGaugeValueMode.Color,
                    label: 'Color',
                    ariaLabel: TEST_IDS.columnEditor.fieldGaugeValueDisplayOption.selector(BarGaugeValueMode.Color),
                  },
                  {
                    value: BarGaugeValueMode.Hidden,
                    label: 'Hidden',
                    ariaLabel: TEST_IDS.columnEditor.fieldGaugeValueDisplayOption.selector(BarGaugeValueMode.Hidden),
                  },
                  {
                    value: BarGaugeValueMode.Text,
                    label: 'Text',
                    ariaLabel: TEST_IDS.columnEditor.fieldGaugeValueDisplayOption.selector(BarGaugeValueMode.Text),
                  },
                ]}
              />
            </InlineField>
            {value.gauge?.valueDisplayMode !== BarGaugeValueMode.Hidden && (
              <InlineField label="Value size" grow={true}>
                <Slider
                  value={gaugeValueSize}
                  min={8}
                  max={20}
                  step={1}
                  onChange={(size) => {
                    setGaugeValueSize(size);
                  }}
                  onAfterChange={(size) => {
                    onChange({
                      ...value,
                      gauge: {
                        ...value.gauge,
                        valueSize: size!,
                      },
                    });
                  }}
                  {...TEST_IDS.columnEditor.fieldGaugeValueTextSize.apply()}
                />
              </InlineField>
            )}
          </FieldsGroup>
        )}
        {value.type === CellType.NESTED_OBJECTS && (
          <InlineField label="Object" grow={true}>
            <Select
              onChange={(event) => {
                onChange({
                  ...value,
                  objectId: event?.value ?? '',
                });
              }}
              value={value.objectId}
              options={nestedObjectOptions}
              isClearable={true}
              isSearchable={true}
              {...TEST_IDS.columnEditor.fieldObjectId.apply()}
            />
          </InlineField>
        )}
        {value.type === CellType.PREFORMATTED && (
          <InlineField label="Preformatted style" grow={true}>
            <InlineSwitch
              value={value.preformattedStyle}
              onChange={(event) =>
                onChange({
                  ...value,
                  preformattedStyle: event.currentTarget.checked,
                })
              }
              {...TEST_IDS.columnEditor.fieldPreformattedStyles.apply()}
            />
          </InlineField>
        )}
        {value.type === CellType.IMAGE && (
          <InlineField label="Scale Algorithm" grow={true}>
            <Select
              options={imageScaleOptions}
              value={value.scale}
              onChange={(event) => {
                onChange({
                  ...value,
                  scale: event.value!,
                });
              }}
              {...TEST_IDS.columnEditor.fieldScale.apply()}
            />
          </InlineField>
        )}
      </FieldsGroup>
      {showTableHeader && (
        <FieldsGroup label="Header">
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
          <InlineFieldRow>
            <InlineField label="Font">
              <ColorEditor
                value={value.appearance.header.fontColor}
                onChange={(color) => {
                  onChange({
                    ...value,
                    appearance: {
                      ...value.appearance,
                      header: cleanPayloadObject({
                        ...value.appearance.header,
                        fontColor: color,
                      }),
                    },
                  });
                }}
                {...TEST_IDS.columnEditor.fieldHeaderFontColor.apply()}
              />
            </InlineField>
            <InlineField label="Background">
              <ColorEditor
                value={value.appearance.header.backgroundColor}
                onChange={(color) => {
                  onChange({
                    ...value,
                    appearance: {
                      ...value.appearance,
                      header: cleanPayloadObject({
                        ...value.appearance.header,
                        backgroundColor: color,
                      }),
                    },
                  });
                }}
                {...TEST_IDS.columnEditor.fieldHeaderBackgroundColor.apply()}
              />
            </InlineField>
            <InlineField label="Size" {...TEST_IDS.columnEditor.fieldHeaderFontSize.apply()}>
              <RadioButtonGroup
                value={value.appearance.header.fontSize}
                onChange={(event) =>
                  onChange({
                    ...value,
                    appearance: {
                      ...value.appearance,
                      header: {
                        ...value.appearance.header,
                        fontSize: event,
                      },
                    },
                  })
                }
                options={[
                  {
                    value: ColumnHeaderFontSize.LG,
                    label: 'lg',
                    ariaLabel: TEST_IDS.columnEditor.fieldHeaderFontSizeOption.selector(ColumnHeaderFontSize.LG),
                  },
                  {
                    value: ColumnHeaderFontSize.MD,
                    label: 'md',
                    ariaLabel: TEST_IDS.columnEditor.fieldHeaderFontSizeOption.selector(ColumnHeaderFontSize.MD),
                  },
                  {
                    value: ColumnHeaderFontSize.SM,
                    label: 'sm',
                    ariaLabel: TEST_IDS.columnEditor.fieldHeaderFontSizeOption.selector(ColumnHeaderFontSize.SM),
                  },
                  {
                    value: ColumnHeaderFontSize.XS,
                    label: 'xs',
                    ariaLabel: TEST_IDS.columnEditor.fieldHeaderFontSizeOption.selector(ColumnHeaderFontSize.XS),
                  },
                ]}
              />
            </InlineField>
          </InlineFieldRow>
        </FieldsGroup>
      )}
      <FieldsGroup label="Width">
        <InlineFieldRow>
          <InlineField label="Auto">
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
            <InlineField label="Size">
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

      {value.type !== CellType.NESTED_OBJECTS && (
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
      )}
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
          {value.type !== CellType.NESTED_OBJECTS && (
            <InlineField label="Group" grow={true}>
              <InlineSwitch
                value={value.group}
                onChange={(event) => {
                  /**
                   * Reset aggregation if group was disabled
                   */
                  const updatedAggregation =
                    !value.group && value.aggregation ? CellAggregation.NONE : value.aggregation;
                  onChange({
                    ...value,
                    group: event.currentTarget.checked,
                    aggregation: updatedAggregation,
                  });
                }}
                {...TEST_IDS.columnEditor.fieldGroup.apply()}
              />
            </InlineField>
          )}
          {value.type !== CellType.NESTED_OBJECTS && showTableHeader && (
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
          )}
          {showTableHeader && (
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
          )}
        </InlineFieldRow>

        {isAggregationAvailable && (
          <InlineField label="Aggregation" grow={true}>
            <Select
              value={value.aggregation}
              options={value.group ? aggregationOptionsForGroup : aggregationOptions}
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

      {value.sort.enabled && showTableHeader && (
        <FieldsGroup label="Sort">
          <InlineField label="Direction" grow={true} {...TEST_IDS.columnEditor.fieldSortDirection.apply()}>
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

      {value.filter.enabled && showTableHeader && (
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

      {value.type !== CellType.NESTED_OBJECTS && (
        <FieldsGroup label="Footer">
          <InlineField label="Show" grow={true}>
            <StatsPicker
              stats={value.footer}
              onChange={(footer) => {
                onChange({
                  ...value,
                  footer,
                });
              }}
            />
          </InlineField>
        </FieldsGroup>
      )}
    </>
  );
};
