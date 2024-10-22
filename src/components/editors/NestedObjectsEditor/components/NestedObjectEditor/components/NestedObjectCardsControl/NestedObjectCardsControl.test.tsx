import { LoadingState } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { sceneGraph, SceneObject } from '@grafana/scenes';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { tablePanelContext, useDatasourceRequest } from '@/hooks';
import { NestedObjectCardsDisplay, NestedObjectControlOptions, NestedObjectType } from '@/types';
import { createNestedObjectEditorConfig, createNestedObjectOperationOptions, NestedObjectCardMapper } from '@/utils';

import { NestedObjectCardsAdd, NestedObjectCardsItem } from './components';
import { NestedObjectCardsControl } from './NestedObjectCardsControl';

/**
 * Props
 */
type Props = React.ComponentProps<typeof NestedObjectCardsControl>;

/**
 * In Test Ids
 */
const inTestIds = {
  buttonAddItem: createSelector('data-testid button-add-item'),
  buttonEditItem: createSelector((id: unknown) => `data-testid button-edit-item ${id}`),
  buttonDeleteItem: createSelector((id: unknown) => `data-testid button-delete-item ${id}`),
  item: createSelector((id: unknown) => `data-testid item-${id}`),
};

/**
 * Mock @grafana/scenes
 */
jest.mock('@grafana/scenes', () => ({
  sceneGraph: {
    getTimeRange: jest.fn(),
  },
}));

/**
 * Mock NestedObjectCardsItem
 */
jest.mock('./components/NestedObjectCardsItem', () => ({
  NestedObjectCardsItem: jest.fn(),
}));

/**
 * Mock NestedObjectCardsItem
 */
jest.mock('./components/NestedObjectCardsAdd', () => ({
  NestedObjectCardsAdd: jest.fn(),
}));

/**
 * Mock useDatasourceRequest
 */
jest.mock('@/hooks/useDatasourceRequest', () => ({
  useDatasourceRequest: jest.fn(),
}));

describe('NestedObjectCardsControl', () => {
  /**
   * Defaults
   */
  const replaceVariables = jest.fn();
  const mapper = new NestedObjectCardMapper(
    createNestedObjectEditorConfig({
      type: NestedObjectType.CARDS,
      id: 'myId',
      title: 'myTitle',
    })
  );

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.nestedObjectCardsControl, ...inTestIds }, ['loadingIcon']);
  const selectors = getSelectors(screen);

  /**
   * Create Options
   */
  const createOptions = (item: Partial<NestedObjectControlOptions>): NestedObjectControlOptions => ({
    config: createNestedObjectEditorConfig({ type: NestedObjectType.CARDS }),
    isLoading: false,
    operations: {
      add: createNestedObjectOperationOptions({}),
      update: createNestedObjectOperationOptions({}),
      delete: createNestedObjectOperationOptions({}),
    },
    header: '',
    type: NestedObjectType.CARDS,
    mapper,
    ...item,
  });

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <tablePanelContext.Provider value={{ replaceVariables }}>
        <NestedObjectCardsControl options={createOptions({})} value={[]} row={{}} {...props} />
      </tablePanelContext.Provider>
    );
  };

  /**
   * Datasource Request Mock
   */
  const datasourceRequestMock = jest.fn();

  /**
   * Open Drawer
   */
  const openDrawer = () => {
    expect(selectors.buttonShowItems()).toBeInTheDocument();
    fireEvent.click(selectors.buttonShowItems());
  };

  beforeEach(() => {
    jest.mocked(NestedObjectCardsItem).mockImplementation(() => null);
    jest.mocked(NestedObjectCardsAdd).mockImplementation(() => null);
    jest.mocked(useDatasourceRequest).mockReturnValue(datasourceRequestMock);

    /**
     * delete __grafanaSceneContext
     */
    delete window.__grafanaSceneContext;
  });

  it('Should show loading state', () => {
    render(
      getComponent({
        options: createOptions({
          isLoading: true,
        }),
      })
    );

    expect(selectors.loadingIcon()).toBeInTheDocument();
  });

  describe('List', () => {
    beforeEach(() => {
      jest.mocked(NestedObjectCardsItem).mockImplementation(({ value }) => <div {...inTestIds.item.apply(value.id)} />);
    });

    it('Should show first 2 items', () => {
      const editorConfig = createNestedObjectEditorConfig({
        type: NestedObjectType.CARDS,
        display: NestedObjectCardsDisplay.FIRST,
        displayCount: 2,
        id: 'id',
        title: 'title',
      });
      const mapper = new NestedObjectCardMapper(editorConfig);

      render(
        getComponent({
          options: createOptions({
            config: editorConfig,
            mapper,
          }),
          value: [
            mapper.createObject({
              id: '1',
              title: 'item 1',
            }),
            mapper.createObject({
              id: '2',
              title: 'item 2',
            }),
            mapper.createObject({
              id: '3',
              title: 'item 2',
            }),
          ],
        })
      );

      expect(selectors.list()).toBeInTheDocument();
      expect(selectors.item(false, '1')).toBeInTheDocument();
      expect(selectors.item(false, '2')).toBeInTheDocument();
      expect(selectors.item(true, '3')).not.toBeInTheDocument();
    });

    it('Should show last 2 items', () => {
      const editorConfig = createNestedObjectEditorConfig({
        type: NestedObjectType.CARDS,
        display: NestedObjectCardsDisplay.LAST,
        displayCount: 2,
        id: 'id',
        title: 'title',
      });
      const mapper = new NestedObjectCardMapper(editorConfig);

      render(
        getComponent({
          options: createOptions({
            config: editorConfig,
            mapper,
          }),
          value: [
            mapper.createObject({
              id: '1',
              title: 'item 1',
            }),
            mapper.createObject({
              id: '2',
              title: 'item 2',
            }),
            mapper.createObject({
              id: '3',
              title: 'item 2',
            }),
          ],
        })
      );

      expect(selectors.list()).toBeInTheDocument();
      expect(selectors.item(true, '1')).not.toBeInTheDocument();
      expect(selectors.item(false, '2')).toBeInTheDocument();
      expect(selectors.item(false, '3')).toBeInTheDocument();
    });

    it('Should show all items', () => {
      const editorConfig = createNestedObjectEditorConfig({
        type: NestedObjectType.CARDS,
        display: NestedObjectCardsDisplay.LAST,
        displayCount: null,
        id: 'id',
        title: 'title',
      });
      const mapper = new NestedObjectCardMapper(editorConfig);

      render(
        getComponent({
          options: createOptions({
            config: editorConfig,
            mapper,
          }),
          value: [
            mapper.createObject({
              id: '1',
              title: 'item 1',
            }),
            mapper.createObject({
              id: '2',
              title: 'item 2',
            }),
            mapper.createObject({
              id: '3',
              title: 'item 2',
            }),
          ],
        })
      );

      expect(selectors.list()).toBeInTheDocument();
      expect(selectors.item(false, '1')).toBeInTheDocument();
      expect(selectors.item(false, '2')).toBeInTheDocument();
      expect(selectors.item(false, '3')).toBeInTheDocument();
    });

    it('Should allow to open drawer', () => {
      const editorConfig = createNestedObjectEditorConfig({
        type: NestedObjectType.CARDS,
        display: NestedObjectCardsDisplay.LAST,
        displayCount: null,
        id: 'id',
        title: 'title',
      });
      const mapper = new NestedObjectCardMapper(editorConfig);

      render(
        getComponent({
          options: createOptions({
            config: editorConfig,
            mapper,
          }),
          value: [
            mapper.createObject({
              id: '1',
              title: 'item 1',
            }),
          ],
        })
      );

      expect(selectors.list()).toBeInTheDocument();
      expect(selectors.buttonShowItems()).toBeInTheDocument();
      expect(screen.getAllByTestId(inTestIds.item.selector('1'))).toHaveLength(1);

      fireEvent.click(selectors.buttonShowItems());

      expect(screen.getAllByTestId(inTestIds.item.selector('1'))).toHaveLength(2);
    });
  });

  it('Should show no items message', () => {
    render(
      getComponent({
        options: createOptions({
          isLoading: false,
          header: 'comments',
        }),
      })
    );

    openDrawer();

    expect(selectors.noItemsMessage()).toBeInTheDocument();

    expect(selectors.buttonCloseDrawer()).toBeInTheDocument();
    fireEvent.click(selectors.buttonCloseDrawer());

    expect(selectors.noItemsMessage(true)).not.toBeInTheDocument();
  });

  describe('Add', () => {
    beforeEach(() => {
      jest.mocked(NestedObjectCardsAdd).mockImplementation(({ mapper, onAdd }) => (
        <button
          {...inTestIds.buttonAddItem.apply()}
          onClick={async () => {
            try {
              await onAdd(
                mapper.getPayload({
                  myId: '1',
                  myTitle: 'hello',
                })
              );
            } catch (e) {}
          }}
        />
      ));
    });

    it('Should allow to add', async () => {
      const row = { deviceId: 123 };

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              add: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              update: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          row,
        })
      );

      datasourceRequestMock.mockResolvedValue({});

      openDrawer();

      expect(selectors.buttonAddItem()).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonAddItem()));

      expect(datasourceRequestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          datasource: 'postgres',
          payload: {
            item: {
              myId: '1',
              myTitle: 'hello',
            },
            row,
          },
        })
      );

      /**
       * Should run refresh
       */
      expect(getAppEvents().publish).toHaveBeenCalledWith(expect.objectContaining({ type: 'variables-changed' }));
      expect(getAppEvents().publish).toHaveBeenCalledTimes(2);
    });

    it('Should allow to add in scene dashboard and refresh panel', async () => {
      window.__grafanaSceneContext = {
        body: {
          text: 'hello',
        },
      };

      jest.mocked(sceneGraph.getTimeRange).mockReturnValue({
        onRefresh: jest.fn(),
      } as any);

      const sceneResult = sceneGraph.getTimeRange(window.__grafanaSceneContext as SceneObject);

      const row = { deviceId: 123 };

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              add: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              update: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          row,
        })
      );

      datasourceRequestMock.mockResolvedValue({});

      openDrawer();

      expect(selectors.buttonAddItem()).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonAddItem()));

      expect(datasourceRequestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          datasource: 'postgres',
          payload: {
            item: {
              myId: '1',
              myTitle: 'hello',
            },
            row,
          },
        })
      );

      expect(getAppEvents().publish).toHaveBeenCalledWith(
        expect.objectContaining({ payload: ['Success', 'Item has been added successfully.'], type: 'alert-success' })
      );
      expect(getAppEvents().publish).toHaveBeenCalledTimes(1);

      /**
       * Should run refresh
       */
      expect(sceneResult.onRefresh).toHaveBeenCalledTimes(1);
    });

    it('Should show response error', async () => {
      const row = { deviceId: 123 };

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              add: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              update: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          row,
        })
      );

      datasourceRequestMock.mockRejectedValue(new Error('response error'));

      openDrawer();

      expect(selectors.buttonAddItem()).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonAddItem()));

      expect(getAppEvents().publish).toHaveBeenCalledWith({
        payload: ['Error', new Error('response error')],
        type: 'alert-error',
      });
    });

    it('Should show response errors', async () => {
      const row = { deviceId: 123 };

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              add: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              update: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          row,
        })
      );

      datasourceRequestMock.mockResolvedValue({
        state: LoadingState.Error,
        errors: [new Error('response_error')],
      });

      openDrawer();

      expect(selectors.buttonAddItem()).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonAddItem()));

      expect(getAppEvents().publish).toHaveBeenCalledWith({
        payload: ['Error', new Error('response_error')],
        type: 'alert-error',
      });
    });

    it('Should show unknown error', async () => {
      const row = { deviceId: 123 };

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              add: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              update: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          row,
        })
      );

      datasourceRequestMock.mockRejectedValue({});

      openDrawer();

      expect(selectors.buttonAddItem()).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonAddItem()));

      expect(getAppEvents().publish).toHaveBeenCalledWith({
        payload: ['Error', 'Unknown Error'],
        type: 'alert-error',
      });
    });
  });

  describe('Update', () => {
    beforeEach(() => {
      jest.mocked(NestedObjectCardsItem).mockImplementation(({ value, onEdit }) => (
        <>
          <button
            {...inTestIds.buttonEditItem.apply(value.id)}
            onClick={async () => {
              try {
                await onEdit(value);
              } catch (e) {}
            }}
          />
        </>
      ));
    });

    it('Should allow to update', async () => {
      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              update: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      datasourceRequestMock.mockResolvedValue({});

      openDrawer();

      expect(selectors.buttonEditItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonEditItem(false, payload.id)));

      expect(datasourceRequestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          datasource: 'postgres',
          payload: {
            item,
            row,
          },
        })
      );
    });

    it('Should show response error', async () => {
      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              update: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      datasourceRequestMock.mockRejectedValue(new Error('response error'));

      openDrawer();

      expect(selectors.buttonEditItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonEditItem(false, payload.id)));

      expect(getAppEvents().publish).toHaveBeenCalledWith({
        payload: ['Error', new Error('response error')],
        type: 'alert-error',
      });
    });

    it('Should show response errors', async () => {
      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              update: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      datasourceRequestMock.mockResolvedValue({
        state: LoadingState.Error,
        errors: [new Error('response_error')],
      });

      openDrawer();

      expect(selectors.buttonEditItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonEditItem(false, payload.id)));

      expect(getAppEvents().publish).toHaveBeenCalledWith({
        payload: ['Error', new Error('response_error')],
        type: 'alert-error',
      });
    });

    it('Should show unknown error', async () => {
      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              update: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      datasourceRequestMock.mockRejectedValue({});

      openDrawer();

      expect(selectors.buttonEditItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonEditItem(false, payload.id)));

      expect(getAppEvents().publish).toHaveBeenCalledWith({
        payload: ['Error', 'Unknown Error'],
        type: 'alert-error',
      });
    });

    it('Should not save if no payload', async () => {
      jest.mocked(NestedObjectCardsItem).mockImplementation(({ value, onEdit }) => (
        <>
          <button
            {...inTestIds.buttonEditItem.apply(value.id)}
            onClick={async () => {
              try {
                await onEdit(null);
              } catch (e) {}
            }}
          />
        </>
      ));

      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              update: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      openDrawer();

      expect(selectors.buttonEditItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonEditItem(false, payload.id)));

      expect(datasourceRequestMock).not.toHaveBeenCalled();
    });

    it('Should not save if disabled', async () => {
      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              update: createNestedObjectOperationOptions({
                enabled: false,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              delete: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      openDrawer();

      expect(selectors.buttonEditItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonEditItem(false, payload.id)));

      expect(datasourceRequestMock).not.toHaveBeenCalled();
    });
  });

  describe('Delete', () => {
    beforeEach(() => {
      jest.mocked(NestedObjectCardsItem).mockImplementation(({ value, onDelete }) => (
        <>
          <button
            {...inTestIds.buttonDeleteItem.apply(value.id)}
            onClick={async () => {
              try {
                await onDelete?.(value);
              } catch (e) {}
            }}
          />
        </>
      ));
    });

    it('Should allow to delete', async () => {
      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              delete: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              update: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      datasourceRequestMock.mockResolvedValue({});

      openDrawer();

      expect(selectors.buttonDeleteItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonDeleteItem(false, payload.id)));

      expect(datasourceRequestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          datasource: 'postgres',
          payload: {
            item,
            row,
          },
        })
      );
    });

    it('Should show response error', async () => {
      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              delete: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              update: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      datasourceRequestMock.mockRejectedValue(new Error('response error'));

      openDrawer();

      expect(selectors.buttonDeleteItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonDeleteItem(false, payload.id)));

      expect(getAppEvents().publish).toHaveBeenCalledWith({
        payload: ['Error', new Error('response error')],
        type: 'alert-error',
      });
    });

    it('Should show response errors', async () => {
      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              delete: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              update: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      datasourceRequestMock.mockResolvedValue({
        state: LoadingState.Error,
        errors: [new Error('response_error')],
      });

      openDrawer();

      expect(selectors.buttonDeleteItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonDeleteItem(false, payload.id)));

      expect(getAppEvents().publish).toHaveBeenCalledWith({
        payload: ['Error', new Error('response_error')],
        type: 'alert-error',
      });
    });

    it('Should show unknown error', async () => {
      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              delete: createNestedObjectOperationOptions({
                enabled: true,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              update: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      datasourceRequestMock.mockRejectedValue({});

      openDrawer();

      expect(selectors.buttonDeleteItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonDeleteItem(false, payload.id)));

      expect(getAppEvents().publish).toHaveBeenCalledWith({
        payload: ['Error', 'Unknown Error'],
        type: 'alert-error',
      });
    });

    it('Should not save if disabled', async () => {
      const row = { deviceId: 123 };
      const payload = {
        id: '123',
        title: 'title',
      };
      const item = mapper.createObject(payload);

      render(
        getComponent({
          options: createOptions({
            isLoading: false,
            operations: {
              delete: createNestedObjectOperationOptions({
                enabled: false,
                request: {
                  datasource: 'postgres',
                  payload: {},
                },
              }),
              add: createNestedObjectOperationOptions({}),
              update: createNestedObjectOperationOptions({}),
            },
          }),
          value: [item],
          row,
        })
      );

      openDrawer();

      expect(selectors.buttonDeleteItem(false, payload.id)).toBeInTheDocument();
      await act(async () => fireEvent.click(selectors.buttonDeleteItem(false, payload.id)));

      expect(datasourceRequestMock).not.toHaveBeenCalled();
    });
  });

  it('Should replace variable with row var', () => {
    jest
      .mocked(NestedObjectCardsItem)
      .mockImplementation(({ value, replaceVariables }) => (
        <div {...inTestIds.item.apply(value.id)}>{replaceVariables(value.body || '')}</div>
      ));

    const row = { deviceId: 123 };
    const payload = {
      id: '123',
      title: 'title',
    };
    const item = mapper.createObject(payload);

    render(
      getComponent({
        value: [item],
        row,
      })
    );

    openDrawer();

    expect(replaceVariables).toHaveBeenCalledWith('', {
      row: {
        value: row,
      },
    });
  });
});
