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
