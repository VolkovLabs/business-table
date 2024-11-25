import { DataFrame, EventBus } from '@grafana/data';
import { PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Pagination, PaginationMode, TablePaginationConfig, ValueOrUpdater } from '@/types';
import { getFieldBySource, getVariableKeyForLocation, getVariableNumberValue, setVariablesValue } from '@/utils';

import { useRuntimeVariables } from './useRuntimeVariables';

/**
 * Use Pagination
 */
export const usePagination = ({
  paginationConfig,
  data,
  eventBus,
}: {
  paginationConfig?: TablePaginationConfig;
  data: DataFrame[];
  eventBus: EventBus;
}): Pagination => {
  const [value, setValue] = useState<PaginationState>({
    pageSize: paginationConfig?.defaultPageSize || 10,
    pageIndex: 0,
  });
  const { getVariable } = useRuntimeVariables(eventBus, '');

  /**
   * Variables
   */
  const pageIndexVariable = getVariable(paginationConfig?.query?.pageIndexVariable ?? '');
  const pageSizeVariable = getVariable(paginationConfig?.query?.pageSizeVariable ?? '');
  const offsetVariable = getVariable(paginationConfig?.query?.offsetVariable ?? '');

  /**
   * Set initial value from variables
   */
  useEffect(() => {
    setValue((pagination) => {
      if (paginationConfig?.mode === PaginationMode.CLIENT) {
        return pagination;
      }

      let pageIndex = pageIndexVariable
        ? (getVariableNumberValue(pageIndexVariable) ?? pagination.pageIndex)
        : pagination.pageIndex;
      const pageSize = pageSizeVariable
        ? (getVariableNumberValue(pageSizeVariable) ?? pagination.pageSize)
        : pagination.pageSize;

      if (offsetVariable) {
        const offset = getVariableNumberValue(offsetVariable);

        if (offset !== undefined) {
          const calculatedPageIndex = Math.ceil(offset / pageSize);
          if (calculatedPageIndex !== pageIndex) {
            pageIndex = calculatedPageIndex;
          }
        }
      }

      return {
        pageIndex,
        pageSize,
      };
    });
  }, [getVariable, offsetVariable, pageIndexVariable, pageSizeVariable, paginationConfig?.mode]);

  /**
   * Total Count
   */
  const totalCount = useMemo(() => {
    if (paginationConfig?.enabled && paginationConfig?.mode === PaginationMode.QUERY) {
      if (paginationConfig.query?.totalCountField) {
        const field = getFieldBySource(data, paginationConfig.query.totalCountField);

        if (field) {
          return field.values[0];
        }
      }

      return (value.pageIndex + 2) * value.pageSize;
    }

    return 0;
  }, [
    data,
    paginationConfig?.enabled,
    paginationConfig?.mode,
    paginationConfig?.query?.totalCountField,
    value.pageIndex,
    value.pageSize,
  ]);

  /**
   * Change
   */
  const onChange = useCallback(
    (valueOrUpdater: ValueOrUpdater<PaginationState>) => {
      setValue((currentValue) => {
        const updatedValue = typeof valueOrUpdater === 'function' ? valueOrUpdater(currentValue) : valueOrUpdater;

        if (paginationConfig?.mode === PaginationMode.CLIENT) {
          return updatedValue;
        }

        const payloadToReplace: Record<string, unknown> = {};

        /**
         * Update Page Index Variable
         */
        if (pageIndexVariable) {
          payloadToReplace[getVariableKeyForLocation(pageIndexVariable.name)] = updatedValue.pageIndex;
        }

        /**
         * Update Show Count Variable
         */
        if (pageSizeVariable) {
          payloadToReplace[getVariableKeyForLocation(pageSizeVariable.name)] = updatedValue.pageSize;
        }

        /**
         * Update Offset Variable
         */
        if (offsetVariable) {
          payloadToReplace[getVariableKeyForLocation(offsetVariable.name)] =
            updatedValue.pageIndex * updatedValue.pageSize;
        }

        setVariablesValue(payloadToReplace);

        return updatedValue;
      });
    },
    [paginationConfig?.mode, pageIndexVariable, pageSizeVariable, offsetVariable]
  );

  return useMemo(
    () => ({
      isEnabled: !!paginationConfig?.enabled,
      isManual: !paginationConfig?.enabled || paginationConfig.mode === PaginationMode.QUERY,
      value,
      onChange,
      total: totalCount,
    }),
    [onChange, paginationConfig?.enabled, paginationConfig?.mode, totalCount, value]
  );
};
