import { DataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { Field, InlineField, InlineSwitch, Select, useStyles2 } from '@grafana/ui';
import React, { useMemo } from 'react';

import { FieldPicker } from '@/components';
import { TEST_IDS } from '@/constants';
import { PaginationMode, TableConfig } from '@/types';
import { cleanPayloadObject } from '@/utils';

import { getStyles } from './PaginationEditor.styles';

/**
 * Pagination Mode Options
 */
const paginationModeOptions = [
  {
    value: PaginationMode.CLIENT,
    label: 'Client',
  },
  {
    value: PaginationMode.QUERY,
    label: 'Query',
  },
];

/**
 * Value
 */
type Value = TableConfig;

/**
 * Properties
 */
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
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];
}

/**
 * Test Ids
 */
const testIds = TEST_IDS.paginationEditor;

/**
 * Pagination Editor
 */
export const PaginationEditor: React.FC<Props> = ({ value, onChange, data }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Variable Options
   */
  const variableOptions = useMemo(() => {
    if (!value.pagination.enabled || value.pagination.mode !== PaginationMode.QUERY) {
      return [];
    }

    const variables = getTemplateSrv().getVariables();

    return variables.map((variable) => {
      return {
        label: variable.label || variable.name,
        value: variable.name,
      };
    });
  }, [value.pagination.enabled, value.pagination.mode]);

  return (
    <>
      {value.pagination.enabled && (
        <div className={styles.paginationSection}>
          <Field label="Mode">
            <Select
              value={value.pagination.mode}
              onChange={(event) => {
                onChange({
                  ...value,
                  pagination: {
                    ...value.pagination,
                    mode: event.value!,
                  },
                });
              }}
              options={paginationModeOptions}
              {...testIds.fieldPaginationMode.apply()}
            />
          </Field>
        </div>
      )}
      {value.pagination.enabled && value.pagination.mode === PaginationMode.QUERY && (
        <>
          <Field label="Page Index Variable">
            <Select
              value={value.pagination.query?.pageIndexVariable}
              onChange={(event) => {
                onChange({
                  ...value,
                  pagination: {
                    ...value.pagination,
                    query: cleanPayloadObject({
                      ...value.pagination.query,
                      pageIndexVariable: event ? event.value : undefined,
                    }),
                  },
                });
              }}
              options={variableOptions}
              isClearable={true}
              {...testIds.fieldPaginationQueryPageIndexVariable.apply()}
            />
          </Field>
          <Field label="Offset Variable">
            <Select
              value={value.pagination.query?.offsetVariable}
              onChange={(event) => {
                onChange({
                  ...value,
                  pagination: {
                    ...value.pagination,
                    query: cleanPayloadObject({
                      ...value.pagination.query,
                      offsetVariable: event ? event.value : undefined,
                    }),
                  },
                });
              }}
              options={variableOptions}
              isClearable={true}
              {...testIds.fieldPaginationQueryOffsetVariable.apply()}
            />
          </Field>
          <Field label="Page Size Variable">
            <Select
              value={value.pagination.query?.pageSizeVariable}
              onChange={(event) => {
                onChange({
                  ...value,
                  pagination: {
                    ...value.pagination,
                    query: cleanPayloadObject({
                      ...value.pagination.query,
                      pageSizeVariable: event ? event.value : undefined,
                    }),
                  },
                });
              }}
              options={variableOptions}
              isClearable={true}
              {...testIds.fieldPaginationQueryPageSizeVariable.apply()}
            />
          </Field>
          <Field label="Total Count Field">
            <FieldPicker
              value={value.pagination.query?.totalCountField}
              onChange={(field) => {
                onChange({
                  ...value,
                  pagination: {
                    ...value.pagination,
                    query: cleanPayloadObject({
                      ...value.pagination.query,
                      totalCountField: field,
                    }),
                  },
                });
              }}
              data={data}
              {...testIds.fieldPaginationQueryTotalCount.apply()}
            />
          </Field>
        </>
      )}
    </>
  );
};
