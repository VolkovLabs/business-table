import { Button, InlineField, Input } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnFilterMode, ColumnFilterType, ColumnFilterValue } from '@/types';

/**
 * Properties
 */
type Value = ColumnFilterValue & { type: ColumnFilterType.SEARCH };

interface Props {
  /**
   * Value
   *
   * @type {Value}
   */
  value: Value;

  /**
   * Change
   */
  onChange: (value: Value) => void;

  /**
   * Save
   */
  onSave?: () => void;

  /**
   * Cancel
   */
  onCancel?: () => void;

  /**
   * Mode
   *
   * @type {ColumnFilterMode}
   */
  mode: ColumnFilterMode;

  /**
   * Auto Focus
   *
   * @type {boolean}
   */
  autoFocus: boolean;
}

/**
 * Filter Search
 */
export const FilterSearch: React.FC<Props> = ({ value, onChange, mode, onCancel, onSave, autoFocus }) => {
  return (
    <InlineField label="Search" shrink>
      <Input
        placeholder="Search term"
        value={value.value}
        onChange={(event) => {
          onChange({
            ...value,
            value: event.currentTarget.value,
          });
        }}
        autoFocus={autoFocus}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSave?.();
            return;
          }

          if (event.key === 'Escape') {
            onCancel?.();
            return;
          }
        }}
        addonAfter={
          mode === ColumnFilterMode.CLIENT && (
            <Button
              variant={value.caseSensitive ? 'primary' : 'secondary'}
              fill="outline"
              icon="text-fields"
              onClick={() => {
                onChange({
                  ...value,
                  caseSensitive: !value.caseSensitive,
                });
              }}
              tooltip="Match Case"
              {...TEST_IDS.filterSearch.buttonMatchCase.apply()}
            />
          )
        }
        {...TEST_IDS.filterSearch.root.apply()}
      />
    </InlineField>
  );
};
