import { DataFrame, InterpolateFunction } from '@grafana/data';
import { createContext, useContext } from 'react';

import { NestedObjectConfig } from '@/types';

/**
 * Create Custom Context
 */
const createCustomContext = <TValue>() => {
  /**
   * Create Context
   */
  const context = createContext<TValue>({} as never);

  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Provider: context.Provider,
    useContext: () => {
      return useContext(context);
    },
  };
};

/**
 * Tables Editor Context
 */
export const tablesEditorContext = createCustomContext<{
  nestedObjects: NestedObjectConfig[];
}>();

/**
 * Nested Objects Editor Context
 */
export const nestedObjectsEditorContext = createCustomContext<{
  data: DataFrame[];
}>();

/**
 * Table Panel Context
 */
export const tablePanelContext = createCustomContext<{
  replaceVariables: InterpolateFunction;
}>();
