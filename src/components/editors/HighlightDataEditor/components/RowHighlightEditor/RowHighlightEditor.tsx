import { SelectableValue } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { InlineField, InlineFieldRow, RadioButtonGroup, Select } from '@grafana/ui';
import React, { useMemo } from 'react';

import { FieldsGroup } from '@/components';
import { ColorEditor } from '@/components/editors';
import { TEST_IDS } from '@/constants';
import { ColumnConfig, EditorProps, RowHighlightConfig, ScrollToRowPosition } from '@/types';
import { getFieldKey } from '@/utils';

/**
 * Properties
 */
interface Props extends EditorProps<RowHighlightConfig> {
  /**
   * Columns
   *
   * @type {ColumnConfig}
   */
  columns: ColumnConfig[];
}

/**
 * Test Ids
 */
export const testIds = TEST_IDS.rowHighlightEditor;

/**
 * Scroll To Options
 */
const scrollToOptions: Array<SelectableValue<ScrollToRowPosition>> = [
  {
    label: 'Off',
    value: ScrollToRowPosition.NONE,
    ariaLabel: testIds.scrollToOption.selector(ScrollToRowPosition.NONE),
  },
  {
    label: 'Start',
    value: ScrollToRowPosition.START,
    ariaLabel: testIds.scrollToOption.selector(ScrollToRowPosition.START),
  },
  {
    label: 'Center',
    value: ScrollToRowPosition.CENTER,
    ariaLabel: testIds.scrollToOption.selector(ScrollToRowPosition.CENTER),
  },
  {
    label: 'End',
    value: ScrollToRowPosition.END,
    ariaLabel: testIds.scrollToOption.selector(ScrollToRowPosition.END),
  },
];

/**
 * Row Highlight Editor
 */
export const RowHighlightEditor: React.FC<Props> = ({ value, onChange, columns }) => {
  /**
   * Column Options
   */
  const columnOptions = useMemo(() => {
    return columns.map((column) => ({
      value: getFieldKey(column.field),
      label: column.field.name,
    }));
  }, [columns]);

  /**
   * Variable Options
   */
  const templateService = getTemplateSrv();
  const variableOptions = useMemo(() => {
    return templateService.getVariables().map((variable) => ({
      value: variable.name,
      label: variable.label || variable.name,
    }));
  }, [templateService]);

  return (
    <>
      <FieldsGroup label="State">
        <InlineFieldRow>
          <InlineField label="Column">
            <Select
              onChange={(event) => {
                onChange({
                  ...value,
                  columnId: event?.value ?? '',
                });
              }}
              value={value.columnId}
              options={columnOptions}
              isClearable={true}
              {...testIds.fieldColumn.apply()}
            />
          </InlineField>
          <InlineField label="Variable">
            <Select
              onChange={(event) => {
                onChange({
                  ...value,
                  variable: event?.value ?? '',
                });
              }}
              value={value.variable}
              options={variableOptions}
              isClearable={true}
              {...testIds.fieldVariable.apply()}
            />
          </InlineField>
        </InlineFieldRow>
      </FieldsGroup>
      <FieldsGroup label="Appearance">
        <InlineField label="Auto scroll to" {...testIds.fieldScrollTo.apply()}>
          <RadioButtonGroup
            options={scrollToOptions}
            value={value.scrollTo}
            onChange={(scrollTo) => {
              onChange({
                ...value,
                scrollTo,
              });
            }}
          />
        </InlineField>
        <InlineField label="Background">
          <ColorEditor
            value={value.backgroundColor}
            onChange={(color) => {
              onChange({
                ...value,
                backgroundColor: color,
              });
            }}
            {...testIds.fieldBackgroundColor.apply()}
          />
        </InlineField>
      </FieldsGroup>
    </>
  );
};
