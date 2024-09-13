import { TypedVariableModel } from '@grafana/data';
import { locationService } from '@grafana/runtime';

/**
 * Get Runtime Variable
 * @param variable
 */
export const getRuntimeVariable = (variable: TypedVariableModel): TypedVariableModel | undefined => {
  return variable;
};

/**
 * Get Variables Map
 */
export const getVariablesMap = (variables: TypedVariableModel[]): Record<string, TypedVariableModel> => {
  return variables.reduce((acc, variable) => {
    const runtimeVariable = getRuntimeVariable(variable);
    if (runtimeVariable) {
      return {
        ...acc,
        [runtimeVariable.name]: runtimeVariable,
      };
    }
    return acc;
  }, {});
};

/**
 * Get Variable Number Value
 */
export const getVariableNumberValue = (variable: TypedVariableModel): number | undefined => {
  if ('current' in variable) {
    const unknownValue = variable.current.value;
    const stringValue =
      typeof unknownValue === 'string' ? unknownValue : Array.isArray(unknownValue) ? unknownValue[0] : '';

    const numberValue = Number(stringValue);

    if (Number.isNaN(numberValue)) {
      return;
    }

    return numberValue;
  }

  return;
};

/**
 * Set Variable Value
 * @param name
 * @param value
 */
export const setVariableValue = (name: string, value: unknown) => {
  /**
   * Update value in url
   */
  locationService.partial(
    {
      [`var-${name}`]: value,
    },
    true
  );
};
