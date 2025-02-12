import { DataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { Field, Select } from '@grafana/ui';
import React, { useMemo } from 'react';

import { FieldPicker } from '@/components';
import { PAGE_SIZE_OPTIONS, TEST_IDS } from '@/constants';
import { EditorProps, PaginationMode, TableConfig } from '@/types';
import { cleanPayloadObject, hasTablePaginationError, hasTablePaginationQueryDisabled } from '@/utils';

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
 * Properties
 */
interface Props extends EditorProps<TableConfig> {
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
        <Field
          label="Mode"
          invalid={hasTablePaginationError(value)}
          error="Query pagination is not supported with client filtering"
        >
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
            options={paginationModeOptions.map((option) => {
              if (option.value === PaginationMode.QUERY) {
                const isDisabled = hasTablePaginationQueryDisabled(value);

                return {
                  ...option,
                  isDisabled,
                  description: isDisabled ? 'Not supported with client filtering' : '',
                };
              }

              return option;
            })}
            {...testIds.fieldPaginationMode.apply()}
          />
        </Field>
      )}
      {value.pagination.enabled && (
        <Field label="Default page size">
          <Select
            value={value.pagination.defaultPageSize}
            onChange={(event) => {
              onChange({
                ...value,
                pagination: {
                  ...value.pagination,
                  defaultPageSize: event.value!,
                },
              });
            }}
            options={PAGE_SIZE_OPTIONS}
            {...testIds.fieldPaginationDefaultPageSize.apply()}
          />
        </Field>
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
