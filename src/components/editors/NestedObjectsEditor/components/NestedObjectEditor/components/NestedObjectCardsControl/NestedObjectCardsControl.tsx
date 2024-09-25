import { AlertErrorPayload, AlertPayload, AppEvents, LoadingState, ScopedVars } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { Button, Drawer, EmptySearchResult, Icon } from '@grafana/ui';
import React, { useCallback, useState } from 'react';

import { tablePanelContext, useDatasourceRequest } from '@/hooks';
import { NestedObjectControlProps, NestedObjectItemPayload, NestedObjectType } from '@/types';

import { NestedObjectCardsAdd, NestedObjectCardsItem } from './components';

/**
 * Properties
 */
type Props = NestedObjectControlProps<NestedObjectType.CARDS>;

/**
 * Nested Object Cards Control
 */
export const NestedObjectCardsControl: React.FC<Props> = ({
  value,
  row,
  options: { isLoading, mapper, operations, header },
}) => {
  /**
   * State
   */
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  /**
   * Data Source Request
   */
  const datasourceRequest = useDatasourceRequest();

  /**
   * Context
   */
  const { replaceVariables } = tablePanelContext.useContext();

  /**
   * App Events
   */
  const appEvents = getAppEvents();
  const notifySuccess = useCallback(
    (payload: AlertPayload) => appEvents.publish({ type: AppEvents.alertSuccess.name, payload }),
    [appEvents]
  );
  const notifyError = useCallback(
    (payload: AlertErrorPayload) => appEvents.publish({ type: AppEvents.alertError.name, payload }),
    [appEvents]
  );

  /**
   * Add
   */
  const onAdd = useCallback(
    async (payload: NestedObjectItemPayload) => {
      if (operations.add.enabled && operations.add.request) {
        try {
          const item = mapper.createObject(payload);

          const response = await datasourceRequest({
            query: operations.add.request.payload,
            datasource: operations.add.request.datasource,
            payload: {
              row,
              item,
            },
            replaceVariables,
          });

          /**
           * Query Error
           */
          if (response.state === LoadingState.Error) {
            throw response.errors;
          }

          notifySuccess(['Success', 'Item has been added successfully.']);
          appEvents.publish({ type: 'variables-changed', payload: { refreshAll: true } });
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e : Array.isArray(e) ? e[0] : 'Unknown Error';
          notifyError(['Error', errorMessage]);
          throw e;
        }
      }
    },
    [
      appEvents,
      datasourceRequest,
      mapper,
      notifyError,
      notifySuccess,
      operations.add.enabled,
      operations.add.request,
      replaceVariables,
      row,
    ]
  );

  /**
   * Update
   */
  const onUpdate = useCallback(
    async (payload: NestedObjectItemPayload | null) => {
      if (!payload) {
        return;
      }

      if (operations.update.enabled && operations.update.request) {
        try {
          const item = mapper.createObject(payload);
          const response = await datasourceRequest({
            query: operations.update.request.payload,
            datasource: operations.update.request.datasource,
            payload: {
              row,
              item,
            },
            replaceVariables,
          });

          /**
           * Query Error
           */
          if (response.state === LoadingState.Error) {
            throw response.errors;
          }

          notifySuccess(['Success', 'Item has been updated successfully.']);
          appEvents.publish({ type: 'variables-changed', payload: { refreshAll: true } });
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e : Array.isArray(e) ? e[0] : 'Unknown Error';
          notifyError(['Error', errorMessage]);
          throw e;
        }
      }
    },
    [
      appEvents,
      datasourceRequest,
      mapper,
      notifyError,
      notifySuccess,
      operations.update.enabled,
      operations.update.request,
      replaceVariables,
      row,
    ]
  );

  /**
   * Delete
   */
  const onDelete = useCallback(
    async (payload: NestedObjectItemPayload | null) => {
      if (!payload) {
        return;
      }

      if (operations.delete.enabled && operations.delete.request) {
        try {
          const item = mapper.createObject(payload);
          const response = await datasourceRequest({
            query: operations.delete.request.payload,
            datasource: operations.delete.request.datasource,
            payload: {
              row,
              item,
            },
            replaceVariables,
          });

          /**
           * Query Error
           */
          if (response.state === LoadingState.Error) {
            throw response.errors;
          }

          notifySuccess(['Success', 'Item has been deleted successfully.']);
          appEvents.publish({ type: 'variables-changed', payload: { refreshAll: true } });
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e : Array.isArray(e) ? e[0] : 'Unknown Error';
          notifyError(['Error', errorMessage]);
          throw e;
        }
      }
    },
    [
      appEvents,
      datasourceRequest,
      mapper,
      notifyError,
      notifySuccess,
      operations.delete.enabled,
      operations.delete.request,
      replaceVariables,
      row,
    ]
  );

  /**
   * Replace Variables
   */
  const onReplaceVariables = useCallback(
    (str: string, scopedVars?: ScopedVars) => {
      return replaceVariables(str, {
        row: {
          value: row,
        },
        ...scopedVars,
      });
    },
    [replaceVariables, row]
  );

  /**
   * Loading
   */
  if (isLoading && !isDrawerOpen) {
    return <Icon name="spinner" />;
  }

  return (
    <>
      <Button
        variant={value.length > 0 ? 'primary' : 'secondary'}
        fill="text"
        size="sm"
        onClick={() => setDrawerOpen(true)}
      >
        {value.length} {header}
      </Button>
      {isDrawerOpen && (
        <Drawer title={header} onClose={() => setDrawerOpen(false)}>
          {value.length > 0 ? (
            value.map((item, index) => {
              const itemPayload = mapper.getPayload(item);
              return (
                <NestedObjectCardsItem
                  key={itemPayload.id || index}
                  value={itemPayload}
                  isEditEnabled={operations.update.enabled}
                  isDeleteEnabled={operations.delete.enabled}
                  onEdit={onUpdate}
                  onDelete={onDelete}
                  replaceVariables={onReplaceVariables}
                />
              );
            })
          ) : (
            <EmptySearchResult>{`No ${header}`}</EmptySearchResult>
          )}
          {operations.add.enabled && (
            <NestedObjectCardsAdd mapper={mapper} onAdd={onAdd} replaceVariables={onReplaceVariables} />
          )}
        </Drawer>
      )}
    </>
  );
};
