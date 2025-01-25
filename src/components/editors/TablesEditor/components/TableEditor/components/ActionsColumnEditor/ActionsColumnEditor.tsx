import { InlineField, InlineFieldRow, InlineSwitch, Input, RadioButtonGroup, useTheme2 } from '@grafana/ui';
import { Collapse, NumberInput } from '@volkovlabs/components';
import React, { useState } from 'react';

import { CollapseTitle, FieldsGroup } from '@/components/ui';
import { TEST_IDS } from '@/constants';
import { ActionsColumnConfig, ColumnAlignment, ColumnHeaderFontSize, EditorProps } from '@/types';

import { getStyles } from './ActionsColumnEditor.styles';

/**
 * Properties
 */
type Props = EditorProps<ActionsColumnConfig>;

/**
 * Test Ids
 */
const testIds = TEST_IDS.actionColumnsEditor;

/**
 * Actions Column Editor
 */
export const ActionsColumnEditor: React.FC<Props> = ({ value, onChange }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.item} {...TEST_IDS.actionColumnsEditor.root.apply()}>
      <Collapse
        headerTestId={testIds.itemHeader.selector()}
        contentTestId={testIds.itemContent.selector()}
        fill="solid"
        title={
          <CollapseTitle>
            {`[actions]: `}
            {`${value.label}`}
          </CollapseTitle>
        }
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      >
        <>
          <FieldsGroup label="Header">
            <InlineField label="Label" grow={true}>
              <Input
                value={value.label}
                placeholder="Column header title"
                onChange={(event) =>
                  onChange({
                    ...value,
                    label: event.currentTarget.value,
                  })
                }
                {...TEST_IDS.actionColumnsEditor.fieldLabel.apply()}
              />
            </InlineField>
            <InlineField label="Size" {...TEST_IDS.actionColumnsEditor.fieldHeaderFontSize.apply()}>
              <RadioButtonGroup
                value={value.fontSize}
                onChange={(event) =>
                  onChange({
                    ...value,
                    fontSize: event,
                  })
                }
                options={[
                  {
                    value: ColumnHeaderFontSize.LG,
                    label: 'lg',
                    ariaLabel: TEST_IDS.actionColumnsEditor.fieldHeaderFontSizeOption.selector(ColumnHeaderFontSize.LG),
                  },
                  {
                    value: ColumnHeaderFontSize.MD,
                    label: 'md',
                    ariaLabel: TEST_IDS.actionColumnsEditor.fieldHeaderFontSizeOption.selector(ColumnHeaderFontSize.MD),
                  },
                  {
                    value: ColumnHeaderFontSize.SM,
                    label: 'sm',
                    ariaLabel: TEST_IDS.actionColumnsEditor.fieldHeaderFontSizeOption.selector(ColumnHeaderFontSize.SM),
                  },
                  {
                    value: ColumnHeaderFontSize.XS,
                    label: 'xs',
                    ariaLabel: TEST_IDS.actionColumnsEditor.fieldHeaderFontSizeOption.selector(ColumnHeaderFontSize.XS),
                  },
                ]}
              />
            </InlineField>
          </FieldsGroup>
          <FieldsGroup label="Width">
            <InlineFieldRow>
              <InlineField label="Auto">
                <InlineSwitch
                  value={value.width.auto}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      width: {
                        ...value.width,
                        auto: event.currentTarget.checked,
                      },
                    })
                  }
                  {...TEST_IDS.actionColumnsEditor.fieldAppearanceWidthAuto.apply()}
                />
              </InlineField>
              {value.width.auto ? (
                <>
                  <InlineField label="Min">
                    <NumberInput
                      value={value.width.min ?? 0}
                      onChange={(min) => {
                        onChange({
                          ...value,
                          width: {
                            ...value.width,
                            min,
                          },
                        });
                      }}
                      {...TEST_IDS.actionColumnsEditor.fieldAppearanceWidthMin.apply()}
                    />
                  </InlineField>
                  <InlineField label="Max">
                    <NumberInput
                      value={value.width.max ?? 0}
                      placeholder="Max"
                      onChange={(max) => {
                        onChange({
                          ...value,
                          width: {
                            ...value.width,
                            max: max,
                          },
                        });
                      }}
                      {...TEST_IDS.actionColumnsEditor.fieldAppearanceWidthMax.apply()}
                    />
                  </InlineField>
                </>
              ) : (
                <InlineField label="Size">
                  <NumberInput
                    value={value.width.value}
                    placeholder="Auto"
                    onChange={(width) => {
                      onChange({
                        ...value,
                        width: {
                          ...value.width,
                          value: width,
                        },
                      });
                    }}
                    {...TEST_IDS.actionColumnsEditor.fieldAppearanceWidthValue.apply()}
                  />
                </InlineField>
              )}
            </InlineFieldRow>
          </FieldsGroup>
          <InlineField label="Alignment" {...TEST_IDS.actionColumnsEditor.fieldAppearanceAlignment.apply()}>
            <RadioButtonGroup
              value={value.alignment}
              onChange={(event) =>
                onChange({
                  ...value,
                  alignment: event,
                })
              }
              options={[
                {
                  value: ColumnAlignment.START,
                  icon: 'align-left',
                  description: 'Start',
                  ariaLabel: TEST_IDS.actionColumnsEditor.fieldAppearanceAlignmentOption.selector(
                    ColumnAlignment.START
                  ),
                },
                {
                  value: ColumnAlignment.CENTER,
                  icon: 'bars',
                  description: 'Center',
                  ariaLabel: TEST_IDS.actionColumnsEditor.fieldAppearanceAlignmentOption.selector(
                    ColumnAlignment.CENTER
                  ),
                },
                {
                  value: ColumnAlignment.END,
                  icon: 'align-right',
                  description: 'End',
                  ariaLabel: TEST_IDS.actionColumnsEditor.fieldAppearanceAlignmentOption.selector(ColumnAlignment.END),
                },
              ]}
            />
          </InlineField>
        </>
      </Collapse>
    </div>
  );
};
