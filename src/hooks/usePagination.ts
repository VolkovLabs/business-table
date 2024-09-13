import { DataFrame, EventBus } from '@grafana/data';
import { PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Pagination, PaginationMode, TablePaginationConfig, ValueOrUpdater } from '@/types';
import { getFieldBySource, getVariableNumberValue, setVariableValue } from '@/utils';

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
    pageSize: 10,
    pageIndex: 1,
  });
  const { getVariable } = useRuntimeVariables(eventBus, '');

  /**
   * Variables
   */
  const pageIndexVariable = getVariable(paginationConfig?.query?.pageIndexVariable ?? '');
  const pageSizeVariable = getVariable(paginationConfig?.query?.pageSizeVariable ?? '');

  /**
   * Set initial value from variables
   */
  useEffect(() => {
    setValue((pagination) => {
      const pageIndex = pageIndexVariable
        ? (getVariableNumberValue(pageIndexVariable) ?? pagination.pageIndex)
        : pagination.pageIndex;
      const showCount = pageSizeVariable
        ? (getVariableNumberValue(pageSizeVariable) ?? pagination.pageSize)
        : pagination.pageSize;

      return {
        pageIndex,
        pageSize: showCount,
      };
    });
  }, [getVariable, pageIndexVariable, pageSizeVariable]);

  /**
   * Total Count
   */
  const totalCount = useMemo(() => {
    if (paginationConfig?.enabled && paginationConfig.query?.totalCountField) {
      const field = getFieldBySource(data, paginationConfig.query?.totalCountField);

      if (field) {
        return field.values[0];
      }
    }

    return 0;
  }, [data, paginationConfig?.enabled, paginationConfig?.query?.totalCountField]);

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

        /**
         * Update Page Index Variable
         */
        if (pageIndexVariable) {
          setVariableValue(pageIndexVariable.name, updatedValue.pageIndex);
        }

        /**
         * Update Show Count Variable
         */
        if (pageSizeVariable) {
          setVariableValue(pageSizeVariable.name, updatedValue.pageSize);
        }

        return updatedValue;
      });
    },
    [pageIndexVariable, paginationConfig?.mode, pageSizeVariable]
  );

  return useMemo(
    () => ({
      isEnabled: !!paginationConfig?.enabled,
      isManual: !!paginationConfig?.enabled && paginationConfig.mode === PaginationMode.QUERY,
      value,
      onChange,
      total: totalCount,
    }),
    [onChange, paginationConfig?.enabled, paginationConfig?.mode, totalCount, value]
  );
};
