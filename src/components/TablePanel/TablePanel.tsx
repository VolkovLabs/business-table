import { cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { ToolbarButton, ToolbarButtonRow, useStyles2 } from '@grafana/ui';
import React, { useEffect, useMemo } from 'react';

import { TEST_IDS } from '../../constants';
import { useSavedState, useTable } from '../../hooks';
import { PanelOptions } from '../../types';
import { Table } from '../Table';
import { getStyles } from './TablePanel.styles';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const TablePanel: React.FC<Props> = ({ id, data, width, height, options }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Current group
   */
  const [currentGroup, setCurrentGroup] = useSavedState<string>({
    key: `volkovlabs.table.panel.${id}`,
    initialValue: options.groups?.[0]?.name || '',
  });

  /**
   * Current Columns
   */
  const currentColumns = useMemo(() => {
    if (options.groups?.length && currentGroup) {
      return options.groups.find((group) => group.name === currentGroup)?.items;
    }
    return;
  }, [options.groups, currentGroup]);

  /**
   * Table
   */
  const { tableData, columns } = useTable({ data, columns: currentColumns });

  /**
   * Change current group if was removed
   */
  useEffect(() => {
    if (!options.groups?.some((group) => group.name === currentGroup)) {
      setCurrentGroup(options.groups?.[0]?.name || '');
    }
  }, [currentGroup, id, options.groups, setCurrentGroup]);

  /**
   * Show selected group first
   */
  const sortedGroups = useMemo(() => {
    if (!options.groups) {
      return [];
    }

    const activeGroup = options.groups.find((group) => group.name === currentGroup);

    /**
     * Selected group is not found
     */
    if (!activeGroup) {
      return options.groups;
    }

    const withoutActive = options.groups.filter((group) => group.name !== currentGroup);

    return [activeGroup, ...withoutActive];
  }, [currentGroup, options.groups]);

  /**
   * Return
   */
  return (
    <div
      data-testid={TEST_IDS.panel.root}
      className={cx(styles.root)}
      style={{
        width,
        height,
      }}
    >
      {sortedGroups.length > 1 && (
        <div className={styles.header}>
          <ToolbarButtonRow alignment="left" key={currentGroup} className={styles.toolbar}>
            {sortedGroups.map((group, index) => (
              <ToolbarButton
                key={group.name}
                variant={currentGroup === group.name ? 'active' : 'default'}
                onClick={() => {
                  setCurrentGroup(group.name);
                }}
                className={styles.toolbarButton}
                style={{
                  maxWidth: index === 0 ? width - 60 : undefined,
                }}
              >
                {group.name}
              </ToolbarButton>
            ))}
          </ToolbarButtonRow>
        </div>
      )}
      <Table data={tableData} columns={columns} height={height} />
    </div>
  );
};
