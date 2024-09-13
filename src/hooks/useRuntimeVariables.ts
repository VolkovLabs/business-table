import { EventBus, TypedVariableModel } from '@grafana/data';
import { getTemplateSrv, RefreshEvent } from '@grafana/runtime';
import { useCallback, useEffect, useState } from 'react';

import { getVariablesMap } from '@/utils';

/**
 * Runtime Variables
 * @param eventBus
 * @param variableName
 */
export const useRuntimeVariables = (eventBus: EventBus, variableName: string) => {
  const [variables, setVariables] = useState<Record<string, TypedVariableModel>>({});
  const [variable, setVariable] = useState<TypedVariableModel>();

  useEffect(() => {
    setVariables(getVariablesMap(getTemplateSrv().getVariables()));

    /**
     * Update variable on Refresh
     */
    const subscriber = eventBus.getStream(RefreshEvent).subscribe(() => {
      setVariables(getVariablesMap(getTemplateSrv().getVariables()));
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus]);

  const getVariable = useCallback(
    (variableName: string): TypedVariableModel | undefined => {
      return variables[variableName] || undefined;
    },
    [variables]
  );

  useEffect(() => {
    setVariable(getVariable(variableName));
  }, [getVariable, variableName]);

  return {
    variable,
    getVariable,
  };
};
