import { locationService } from '@grafana/runtime';

import { TableConfig } from '@/types';

/**
 * onRequestSuccess
 * @param notifySuccess
 * @param refreshDashboard
 * @param currentTable
 * @param operation
 * @param row
 */
export const onRequestSuccess = (
  notifySuccess: () => void,
  refreshDashboard: () => void,
  currentTable: TableConfig | undefined,
  operation: 'add' | 'update' | 'delete',
  row: Record<string, unknown>
) => {
  /**
   * Run notify
   */
  notifySuccess();

  /**
   * Do check for delete operation
   */
  if (operation === 'delete') {
    /**
     * isHighlightState
     */
    const isHighlightState = row['__rowHighlightStateKey'];

    /**
     * Check highlight and reset variable
     */
    if (isHighlightState && currentTable?.rowHighlight.resetVariable) {
      const currentVariableToReset = currentTable?.rowHighlight.variable;

      /**
       * Reset variable
       */
      if (currentVariableToReset) {
        locationService.partial(
          {
            [`var-${currentVariableToReset}`]: '',
          },
          true
        );

        /**
         * Return to avoid double refresh
         */
        return;
      }
    }
  }

  /**
   * Refresh dashboard
   */
  refreshDashboard();
};
