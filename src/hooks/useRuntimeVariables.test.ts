import { EventBusSrv } from '@grafana/data';
import { getTemplateSrv, RefreshEvent } from '@grafana/runtime';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useRuntimeVariables } from './useRuntimeVariables';

describe('Use Runtime Variables', () => {
  const eventBus = new EventBusSrv();

  const variableDevice = {
    name: 'device',
    type: 'custom',
    options: [
      {
        text: 'Device1',
        value: '1',
      },
    ],
  };
  const variableCountry = {
    name: 'country',
    type: 'custom',
    options: [],
  };

  beforeEach(() => {
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([variableCountry, variableDevice] as never);
  });

  it('Should return variable', () => {
    const { result } = renderHook(() => useRuntimeVariables(eventBus, variableDevice.name));

    expect(result.current.variable).toEqual(variableDevice);
  });

  it('Should update variable', async () => {
    const { result } = renderHook(() => useRuntimeVariables(eventBus, variableDevice.name));

    expect(result.current.variable).toEqual(variableDevice);

    /**
     * Update variables
     */
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([]);

    /**
     * Trigger refresh event
     */
    await act(() => eventBus.publish(RefreshEvent));

    /**
     * Check if updated variable returns
     */
    await waitFor(() => expect(result.current.variable).not.toBeDefined());
  });
});
