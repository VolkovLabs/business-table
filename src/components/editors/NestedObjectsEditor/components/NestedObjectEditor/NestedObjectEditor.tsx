import { InlineField, InlineSwitch, Select, useStyles2 } from '@grafana/ui';
import { Collapse } from '@volkovlabs/components';
import React, { useState } from 'react';

import { CollapseTitle, FieldsGroup, RequestEditor } from '@/components';
import { NestedObjectConfig, NestedObjectOperationConfig, NestedObjectType, PermissionMode } from '@/types';

import { NestedObjectOperationEditor } from './components';
import { getStyles } from './NestedObjectEditor.styles';

/**
 * Value
 */
type Value = NestedObjectConfig;

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
}

/**
 * Type Options
 */
const typeOptions = [
  {
    value: NestedObjectType.COMMENTS,
    label: 'Comments',
  },
];

/**
 * Default Operation Config
 */
const defaultOperationConfig: NestedObjectOperationConfig = {
  enabled: false,
  permission: {
    mode: PermissionMode.ALLOWED,
    userRole: [],
  },
  request: {
    datasource: '',
    payload: {},
  },
};

/**
 * Format Operation Label
 */
const formatOperationLabel = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Nested Object Editor
 */
export const NestedObjectEditor: React.FC<Props> = ({ value, onChange }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Expanded State
   */
  const [expandedState, setExpandedState] = useState({
    get: false,
    add: false,
    update: false,
    delete: false,
  });

  return (
    <>
      <InlineField label="Type" grow={true}>
        <Select
          value={value.type}
          onChange={(event) => {
            onChange({
              ...value,
              type: event.value!,
            });
          }}
          options={typeOptions}
        />
      </InlineField>
      <div className={styles.collapseItem}>
        <Collapse
          isOpen={expandedState.get}
          onToggle={(isOpen) =>
            setExpandedState({
              ...expandedState,
              get: isOpen,
            })
          }
          title={<CollapseTitle>Get Options</CollapseTitle>}
          fill="solid"
        >
          <RequestEditor
            value={value.get}
            onChange={(request) => {
              onChange({
                ...value,
                get: request,
              });
            }}
          />
        </Collapse>
      </div>
      <FieldsGroup label="Operations">
        {(['add', 'update', 'delete'] as Array<'add' | 'update' | 'delete'>).map((operation) => {
          const config = value[operation];

          return (
            <div key={operation} className={styles.collapseItem}>
              <Collapse
                isOpen={expandedState[operation]}
                onToggle={(isOpen) =>
                  setExpandedState({
                    ...expandedState,
                    [operation]: isOpen,
                  })
                }
                title={
                  <CollapseTitle>
                    {`${formatOperationLabel(operation)} Options`}
                    <InlineSwitch
                      transparent={true}
                      value={config?.enabled ?? false}
                      onChange={(event) => {
                        const isEnabled = event.currentTarget.checked;

                        onChange({
                          ...value,
                          [operation]: {
                            ...(config || defaultOperationConfig),
                            enabled: isEnabled,
                          },
                        });

                        setExpandedState({
                          ...expandedState,
                          [operation]: isEnabled,
                        });
                      }}
                    />
                  </CollapseTitle>
                }
                fill="solid"
                isExpandDisabled={!config?.enabled}
              >
                {config && (
                  <NestedObjectOperationEditor
                    value={config}
                    onChange={(updatedConfig) => {
                      onChange({
                        ...value,
                        [operation]: updatedConfig,
                      });
                    }}
                  />
                )}
              </Collapse>
            </div>
          );
        })}
      </FieldsGroup>
    </>
  );
};
