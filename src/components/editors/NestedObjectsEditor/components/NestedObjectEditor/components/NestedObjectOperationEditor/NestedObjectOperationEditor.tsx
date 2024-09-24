import { Collapse } from '@volkovlabs/components';
import React, { useState } from 'react';

import { RequestEditor } from '@/components';
import { NestedObjectOperationConfig } from '@/types';

/**
 * Value
 */
type Value = NestedObjectOperationConfig;

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
 * Nested Object Operation Editor
 */
export const NestedObjectOperationEditor: React.FC<Props> = ({ value, onChange }) => {
  /**
   * Expanded State
   */
  const [expandedState, setExpandedState] = useState({
    request: false,
  });

  return (
    <>
      <Collapse
        isOpen={expandedState.request}
        onToggle={(isOpen) => {
          setExpandedState({
            ...expandedState,
            request: isOpen,
          });
        }}
        title="Request"
      >
        <RequestEditor
          value={value.request}
          onChange={(request) => {
            onChange({
              ...value,
              request,
            });
          }}
        />
      </Collapse>
    </>
  );
};
