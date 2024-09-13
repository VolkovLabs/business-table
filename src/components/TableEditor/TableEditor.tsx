import { DataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { Field, InlineField, InlineSwitch, Select, useStyles2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useMemo, useState } from 'react';

import { FieldPicker } from '@/components';
import { TEST_IDS } from '@/constants';
import { PaginationMode, TableConfig } from '@/types';
import { cleanPayloadObject } from '@/utils';

import { ColumnsEditor } from '../ColumnsEditor';
import { DatasourceEditor } from '../DatasourceEditor';
import { DatasourcePayloadEditor } from '../DatasourcePayloadEditor';
import { getStyles } from './TableEditor.styles';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {TableConfig}
   */
  value: TableConfig;

  /**
   * Change
   */
  onChange: (value: TableConfig) => void;

  /**
   * Data
   */
  data: DataFrame[];
}

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
 * Table Editor
 */
export const TableEditor: React.FC<Props> = ({ value, onChange, data }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);
  /**
   * Expanded State
   */
  const [expanded, setExpanded] = useState({
    update: false,
    pagination: false,
  });

  /**
   * Is Editable Column
   */
  const isEditableColumn = useMemo(() => {
    return value.items.some((item) => item.edit.enabled);
  }, [value.items]);

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
      <ColumnsEditor
        name={value.name}
        value={value.items}
        data={data}
        onChange={(items) => {
          onChange({
            ...value,
            items,
          });
        }}
      />
      {isEditableColumn && (
        <Collapse
          title="Update Request"
          isOpen={expanded.update}
          onToggle={(isOpen) => {
            setExpanded({
              ...expanded,
              update: isOpen,
            });
          }}
          isInlineContent={true}
          headerTestId={TEST_IDS.tableEditor.updateSectionHeader.selector()}
          contentTestId={TEST_IDS.tableEditor.updateSectionContent.selector()}
        >
          <div className={styles.sectionContent}>
            <Field label="Data Source">
              <DatasourceEditor
                value={value.update.datasource}
                onChange={(datasource) => {
                  onChange({
                    ...value,
                    update: {
                      ...value.update,
                      datasource,
                    },
                  });
                }}
              />
            </Field>
            {value.update.datasource && (
              <Field label="Query Editor" description="Updated row is placed in variable `${payload}`">
                <DatasourcePayloadEditor
                  value={value.update.payload}
                  onChange={(payload) => {
                    onChange({
                      ...value,
                      update: {
                        ...value.update,
                        payload: payload as Record<string, unknown>,
                      },
                    });
                  }}
                  datasourceName={value.update.datasource}
                />
              </Field>
            )}
          </div>
        </Collapse>
      )}

      <InlineField label="Pagination">
        <InlineSwitch
          value={value.pagination.enabled}
          onChange={(event) => {
            onChange({
              ...value,
              pagination: {
                ...value.pagination,
                enabled: event.currentTarget.checked,
              },
            });
          }}
        />
      </InlineField>
      {value.pagination.enabled && (
        <Collapse
          title="Pagination Settings"
          isOpen={expanded.pagination}
          onToggle={(isOpen) => {
            setExpanded({
              ...expanded,
              pagination: isOpen,
            });
          }}
          isInlineContent={true}
          headerTestId={TEST_IDS.tableEditor.updateSectionHeader.selector()}
          contentTestId={TEST_IDS.tableEditor.updateSectionContent.selector()}
        >
          <div className={styles.sectionContent}>
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
              />
            </Field>
            {value.pagination.mode === PaginationMode.QUERY && (
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
                  />
                </Field>
              </>
            )}
          </div>
        </Collapse>
      )}
    </>
  );
};
