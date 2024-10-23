import { EventBus, TypedVariableModel } from '@grafana/data';
import { useDashboardVariables } from '@volkovlabs/components';

import { getVariablesMap } from '@/utils';

/**
 * Runtime Variables
 * @param eventBus
 * @param variableName
 */
export const useRuntimeVariables = (eventBus: EventBus, variableName: string) => {
  const { variable, getVariable } = useDashboardVariables<TypedVariableModel, Record<string, TypedVariableModel>>({
    eventBus,
    variableName,
    toState: getVariablesMap,
    getOne: (variablesMap, variableName) => variablesMap[variableName],
    initial: {},
  });

  return {
    variable: variable,
    getVariable: getVariable,
  };
};
