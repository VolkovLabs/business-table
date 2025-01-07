import { AlertPayload, AppEvents, LoadingState, ScopedVars } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { Button, Drawer, EmptySearchResult, Icon, useStyles2 } from '@grafana/ui';
import { useDashboardRefresh, useDatasourceRequest } from '@volkovlabs/components';
import React, { useCallback, useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { tablePanelContext } from '@/hooks';
import { NestedObjectCardsDisplay, NestedObjectControlProps, NestedObjectItemPayload, NestedObjectType } from '@/types';

import { NestedObjectCardsAdd, NestedObjectCardsItem } from './components';
import { getStyles } from './NestedObjectCardsControl.styles';

/**
 * Properties
 */
type Props = NestedObjectControlProps<NestedObjectType.CARDS>;

/**
 * Test Ids
 */
const testIds = TEST_IDS.nestedObjectCardsControl;

/**
 * Nested Object Cards Control
 */
export const NestedObjectCardsControl: React.FC<Props> = ({
  value,
  row,
  options: { isLoading, mapper, operations, header, config },
}) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * State
   */
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  /**
   * Data Source Request
   */
  const datasourceRequest = useDatasourceRequest();

  /**
   * Refresh dashboard
   */
  const refreshDashboard = useDashboardRefresh();

  /**
   * Context
   */
  const { replaceVariables, setError } = tablePanelContext.useContext();

  /**
   * App Events
   */
  const appEvents = getAppEvents();
  const notifySuccess = useCallback(
    (payload: AlertPayload) => appEvents.publish({ type: AppEvents.alertSuccess.name, payload }),
    [appEvents]
  );

  /**
   * Add
   */
  const onAdd = useCallback(
    async (payload: NestedObjectItemPayload) => {
      if (operations.add.enabled && operations.add.request) {
        try {
          setError('');
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
          refreshDashboard();
        } catch (e: unknown) {
          const errorMessage = `Add Item: ${e instanceof Error && e.message ? e.message : Array.isArray(e) ? e[0] : JSON.stringify(e)}`;
          setError(errorMessage);
          throw e;
        }
      }
    },
    [
      datasourceRequest,
      mapper,
      notifySuccess,
      operations.add.enabled,
      operations.add.request,
      refreshDashboard,
      replaceVariables,
      row,
      setError,
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
          setError('');
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
          refreshDashboard();
        } catch (e: unknown) {
          const errorMessage = `Update Item: ${e instanceof Error && e.message ? e.message : Array.isArray(e) ? e[0] : JSON.stringify(e)}`;
          setError(errorMessage);
          throw e;
        }
      }
    },
    [
      datasourceRequest,
      mapper,
      notifySuccess,
      operations.update.enabled,
      operations.update.request,
      refreshDashboard,
      replaceVariables,
      row,
      setError,
    ]
  );

  /**
   * Delete
   */
  const onDelete = useCallback(
    async (payload: NestedObjectItemPayload) => {
      if (operations.delete.enabled && operations.delete.request) {
        try {
          setError('');
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
          refreshDashboard();
        } catch (e: unknown) {
          const errorMessage = `Delete Item: ${e instanceof Error && e.message ? e.message : Array.isArray(e) ? e[0] : JSON.stringify(e)}`;
          setError(errorMessage);
          throw e;
        }
      }
    },
    [
      datasourceRequest,
      mapper,
      notifySuccess,
      operations.delete.enabled,
      operations.delete.request,
      refreshDashboard,
      replaceVariables,
      row,
      setError,
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
   * Rendered Items
   */
  const renderedItems = useMemo(() => {
    if (config.display === NestedObjectCardsDisplay.NONE) {
      return [];
    }

    if (config.displayCount === null) {
      return value;
    }

    if (config.display === NestedObjectCardsDisplay.FIRST) {
      return value.slice(0, config.displayCount);
    }

    return value.slice(-config.displayCount);
  }, [config.display, config.displayCount, value]);

  /**
   * Loading
   */
  if (isLoading && !isDrawerOpen) {
    return <Icon name="spinner" {...testIds.loadingIcon.apply()} />;
  }

  return (
    <>
      {renderedItems.length > 0 ? (
        <div className={styles.list} {...testIds.list.apply()}>
          {renderedItems.map((item, index) => {
            const itemPayload = mapper.getPayload(item);
            return (
              <NestedObjectCardsItem
                key={itemPayload.id || index}
                value={itemPayload}
                isEditEnabled={false}
                isDeleteEnabled={false}
                onEdit={onUpdate}
                replaceVariables={onReplaceVariables}
              />
            );
          })}
          <Button
            variant="primary"
            fill="text"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            {...testIds.buttonShowItems.apply()}
          >
            Show All {header}
          </Button>
        </div>
      ) : (
        <Button
          variant={value.length > 0 ? 'primary' : 'secondary'}
          fill="text"
          size="sm"
          onClick={() => setDrawerOpen(true)}
          {...testIds.buttonShowItems.apply()}
        >
          {value.length} {header}
        </Button>
      )}
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
            <div {...testIds.noItemsMessage.apply()}>
              <EmptySearchResult>{`No ${header}`}</EmptySearchResult>
            </div>
          )}
          {operations.add.enabled && (
            <NestedObjectCardsAdd mapper={mapper} onAdd={onAdd} replaceVariables={onReplaceVariables} />
          )}
        </Drawer>
      )}
    </>
  );
};
