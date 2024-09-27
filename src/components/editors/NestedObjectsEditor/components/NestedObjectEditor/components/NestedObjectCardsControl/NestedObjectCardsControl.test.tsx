import { LoadingState } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { tablePanelContext, useDatasourceRequest } from '@/hooks';
import { NestedObjectControlOptions, NestedObjectType } from '@/types';
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
