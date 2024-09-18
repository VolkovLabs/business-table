import { DataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { Field, InlineField, InlineSwitch, Select, useStyles2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useMemo, useState } from 'react';

import { FieldPicker } from '@/components';
import { TEST_IDS } from '@/constants';
import { PaginationMode, TableConfig } from '@/types';
import { cleanPayloadObject } from '@/utils';

import { ColumnsEditor, TableUpdateEditor } from './components';
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
    editable: false,
  });

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
      <div className={styles.sectionWrapper}>
        <Collapse
          title="Editable Data"
          isOpen={expanded.editable}
          onToggle={(isOpen) => {
            setExpanded({
              ...expanded,
              editable: isOpen,
            });
          }}
        >
          <TableUpdateEditor value={value} onChange={onChange} data={data} />
        </Collapse>
      </div>

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
          {...TEST_IDS.tableEditor.fieldPaginationEnabled.apply()}
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
          headerTestId={TEST_IDS.tableEditor.paginationSectionHeader.selector()}
          contentTestId={TEST_IDS.tableEditor.paginationSectionContent.selector()}
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
                {...TEST_IDS.tableEditor.fieldPaginationMode.apply()}
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
                    {...TEST_IDS.tableEditor.fieldPaginationQueryPageIndexVariable.apply()}
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
                    {...TEST_IDS.tableEditor.fieldPaginationQueryOffsetVariable.apply()}
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
                    {...TEST_IDS.tableEditor.fieldPaginationQueryPageSizeVariable.apply()}
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
                    {...TEST_IDS.tableEditor.fieldPaginationQueryTotalCount.apply()}
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
