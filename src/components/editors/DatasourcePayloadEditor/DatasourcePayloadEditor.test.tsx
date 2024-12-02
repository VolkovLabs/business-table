import { getDataSourceSrv, getTemplateSrv } from '@grafana/runtime';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { DatasourcePayloadEditor } from './DatasourcePayloadEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof DatasourcePayloadEditor>;

/**
 * Mock timers
 */
jest.useFakeTimers();

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  getDataSourceSrv: jest.fn(),
  getTemplateSrv: jest.fn(),
}));

/**
 * In Test Ids
 */
const inTestIds = {
  queryEditor: createSelector('data-testid query-editor'),
};

describe('DatasourcePayloadEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.payloadEditor,
    ...inTestIds,
  });
  const selectors = getSelectors(screen);

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <DatasourcePayloadEditor {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(getTemplateSrv).mockReturnValue({
      replace: jest.fn((str) => str),
    } as never);
  });

  it('Should show loading message', async () => {
    await act(async () => render(getComponent({})));

    expect(selectors.loadingMessage()).toBeInTheDocument();
  });

  it('Should show error message', async () => {
    const dataSourceSrv = {
      get: jest.fn(() => ({
        name: 'postgresName',
        uid: 'postgres',
        components: {},
      })),
    };
    jest.mocked(getDataSourceSrv).mockReturnValue(dataSourceSrv as any);

    await act(async () =>
      render(
        getComponent({
          datasourceUid: 'postgres',
        })
      )
    );

    expect(selectors.errorMessage()).toBeInTheDocument();
  });

  it('Should show query editor', async () => {
    /**
     * Data Source Mock
     */
    const dataSourceSrv = {
      get: jest.fn(() => ({
        name: 'postgresName',
        uid: 'postgres',
        components: {
          QueryEditor: jest.fn(({ onChange, query }) => (
            <input
              {...inTestIds.queryEditor.apply()}
              value={query?.name || ''}
              onChange={(event) =>
                onChange({
                  name: event.target.value,
                })
              }
            />
          )),
        },
      })),
    };
    jest.mocked(getDataSourceSrv).mockReturnValue(dataSourceSrv as any);

    /**
     * On Change
     */
    const onChange = jest.fn();

    await act(async () =>
      render(
        getComponent({
          datasourceUid: 'postgres',
          onChange,
          value: {
            name: 'bye',
          },
        })
      )
    );

    expect(selectors.queryEditor()).toBeInTheDocument();
    expect(selectors.queryEditor()).toHaveValue('bye');

    /**
     * Change query
     */
    fireEvent.change(selectors.queryEditor(), { target: { value: 'hello' } });

    /**
     * Check updated value
     */
    expect(selectors.queryEditor()).toHaveValue('hello');

    /**
     * Run auto save timer
     */
    await act(async () => jest.runOnlyPendingTimersAsync());

    /**
     * Check if saved
     */
    expect(onChange).toHaveBeenCalledWith({
      name: 'hello',
    });
  });

  it('Should clear query if different data source type', async () => {
    /**
     * Data Source Mock
     */

    const dataSourceSrv = {
      get: jest.fn(() => ({
        type: 'grafana-postgres',
        name: 'postgresName',
        uid: 'postgres',
        components: {
          QueryEditor: jest.fn(({ onChange, query }) => (
            <input
              {...inTestIds.queryEditor.apply()}
              value={query?.name || ''}
              onChange={(event) =>
                onChange({
                  name: event.target.value,
                })
              }
            />
          )),
        },
      })),
    };
    jest.mocked(getDataSourceSrv).mockReturnValue(dataSourceSrv as any);

    /**
     * On Change
     */
    const onChange = jest.fn();

    const { rerender } = await act(async () =>
      render(
        getComponent({
          datasourceUid: 'postgres',
          onChange,
          value: {
            name: 'hello',
          },
        })
      )
    );

    expect(selectors.queryEditor()).toBeInTheDocument();

    /**
     * Check if value reset
     */
    expect(selectors.queryEditor()).toHaveValue('hello');

    /**
     * Data Source Mock
     */
    jest.mocked(getDataSourceSrv).mockReturnValue({
      get: jest.fn(() => ({
        type: 'business-input',
        name: 'postgresName',
        uid: 'postgres1',
        components: {
          QueryEditor: jest.fn(({ onChange, query }) => (
            <input
              {...inTestIds.queryEditor.apply()}
              value={query?.name || ''}
              onChange={(event) =>
                onChange({
                  name: event.target.value,
                })
              }
            />
          )),
        },
      })),
    } as any);

    /**
     * Rerender with new datasource
     */
    await act(async () =>
      rerender(
        getComponent({
          datasourceUid: 'postgres1',
          onChange,
          value: {
            name: 'hello',
          },
        })
      )
    );

    /**
     * Check if value reset
     */
    expect(selectors.queryEditor()).toHaveValue('');

    /**
     * Run auto save timer
     */
    await act(async () => jest.runOnlyPendingTimersAsync());

    /**
     * Check if saved
     */
    expect(onChange).toHaveBeenCalledWith({});
  });

  it('Should keep query if same data source type', async () => {
    /**
     * Data Source Mock
     */

    const dataSourceSrv = {
      get: jest.fn(() => ({
        type: 'grafana-postgres',
        name: 'postgresName',
        uid: 'postgres',
        components: {
          QueryEditor: jest.fn(({ onChange, query }) => (
            <input
              {...inTestIds.queryEditor.apply()}
              value={query?.name || ''}
              onChange={(event) =>
                onChange({
                  name: event.target.value,
                })
              }
            />
          )),
        },
      })),
    };
    jest.mocked(getDataSourceSrv).mockReturnValue(dataSourceSrv as any);

    /**
     * On Change
     */
    const onChange = jest.fn();

    const { rerender } = await act(async () =>
      render(
        getComponent({
          datasourceUid: 'postgres',
          onChange,
          value: {
            name: 'hello',
          },
        })
      )
    );

    expect(selectors.queryEditor()).toBeInTheDocument();

    /**
     * Check if value reset
     */
    expect(selectors.queryEditor()).toHaveValue('hello');

    /**
     * Data Source Mock
     */
    jest.mocked(getDataSourceSrv).mockReturnValue({
      get: jest.fn(() => ({
        type: 'grafana-postgres',
        name: 'postgresName',
        uid: 'postgres1',
        components: {
          QueryEditor: jest.fn(({ onChange, query }) => (
            <input
              {...inTestIds.queryEditor.apply()}
              value={query?.name || ''}
              onChange={(event) =>
                onChange({
                  name: event.target.value,
                })
              }
            />
          )),
        },
      })),
    } as any);

    /**
     * Rerender with new datasource
     */
    await act(async () =>
      rerender(
        getComponent({
          datasourceUid: 'postgres1',
          onChange,
          value: {
            name: 'hello',
          },
        })
      )
    );

    /**
     * Check if value reset
     */
    expect(selectors.queryEditor()).toHaveValue('hello');

    /**
     * Run auto save timer
     */
    await act(async () => jest.runOnlyPendingTimersAsync());

    /**
     * Check if saved
     */
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Should show error if unable to get datasource', async () => {
    /**
     * Data Source Mock
     */
    const dataSourceSrv = {
      get: jest.fn(() => null),
    };
    jest.mocked(getDataSourceSrv).mockReturnValue(dataSourceSrv as any);

    await act(async () =>
      render(
        getComponent({
          datasourceUid: 'postgres',
        })
      )
    );

    expect(selectors.errorMessage()).toBeInTheDocument();
  });
});
