import { CustomVariableModel, EventBusSrv, LoadingState, VariableHide } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { renderHook } from '@testing-library/react';

import { useRuntimeVariables } from './useRuntimeVariables';

describe('useRuntimeVariables', () => {
  /**
   * Event Bus
   */
  const eventBus = new EventBusSrv();

  /**
   * Create Variable
   */
  const createVariable = (item: Partial<CustomVariableModel>): CustomVariableModel => ({
    type: 'custom',
    name: '',
    options: [],
    id: '',
    multi: false,
    includeAll: false,
    current: {},
    query: '',
    rootStateKey: '',
    global: false,
    hide: VariableHide.dontHide,
    description: '',
    allValue: null,
    skipUrlSync: false,
    index: 0,
    state: LoadingState.Done,
    error: '',
    ...item,
  });

  it('Should return variables', () => {
    /**
     * Template Srv
     */
    const templateSrvMock = {
      getVariables: jest.fn(() => [createVariable({ name: 'device' })]),
    } as any;

    jest.mocked(getTemplateSrv).mockImplementation(() => templateSrvMock);

    const { result } = renderHook(() => useRuntimeVariables(eventBus, 'device'));

    expect(result.current.getVariable('device')).toEqual(
      expect.objectContaining({
        name: 'device',
      })
    );
  });
});
