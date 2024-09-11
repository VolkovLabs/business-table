import { TEST_IDS } from '@/constants';
import { DataFrame } from '@grafana/data';
import { Field, useStyles2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useMemo } from 'react';

import { TableConfig } from '@/types';

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
  const [expanded, setExpanded] = React.useState({
    update: false,
  });

  /**
   * Is Editable Column
   */
  const isEditableColumn = useMemo(() => {
    return value.items.some((item) => item.edit.enabled);
  }, [value.items]);

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
    </>
  );
};
