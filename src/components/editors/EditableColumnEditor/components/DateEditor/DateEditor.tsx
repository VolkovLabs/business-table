import { DateTime, dateTime } from '@grafana/data';
import { Button, DateTimePicker, InlineField, InlineFieldRow } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {string}
   */
  value?: string;

  /**
   * On Change
   *
   * @param value
   */
  onChange: (value?: string) => void;

  /**
   * Label
   *
   * @type {string}
   */
  label: string;

  /**
   * Data Test id
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'data-testid': string;
}

/**
 * Date Editor
 */
export const DateEditor: React.FC<Props> = ({ value, onChange, label, ...restProps }) => (
  <InlineFieldRow {...restProps}>
    {!!value ? (
      <>
        <InlineField label={label} labelWidth={8}>
          <DateTimePicker
            onChange={(dateTime?: DateTime) => {
              if (dateTime) {
                onChange(dateTime.toISOString());
              }
            }}
            date={dateTime(value)}
            {...TEST_IDS.dateEditor.field.apply()}
          />
        </InlineField>
        <Button
          icon="minus"
          onClick={() => {
            onChange(undefined);
          }}
          variant="secondary"
          {...TEST_IDS.dateEditor.buttonRemoveDate.apply()}
        />
      </>
    ) : (
      <InlineField label={label} labelWidth={8}>
        <Button
          icon="plus"
          onClick={() => {
            onChange(new Date().toISOString());
          }}
          variant="secondary"
          {...TEST_IDS.dateEditor.buttonSetDate.apply()}
        >
          Set {label} Date
        </Button>
      </InlineField>
    )}
  </InlineFieldRow>
);
