import { Icon, Popover, useStyles2, useTheme2 } from '@grafana/ui';
import { Header } from '@tanstack/react-table';
import React, { useCallback, useRef, useState } from 'react';

import { FilterPopup } from '../FilterPopup';
import { getStyles } from './TableHeaderCellFilter.styles';

/**
 * Properties
 */
interface Props<TData> {
  /**
   * Header
   */
  header: Header<TData, unknown>;
}

/**
 * Table Header Cell Filter
 */
export const TableHeaderCellFilter = <TData,>({ header }: Props<TData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Theme
   */
  const theme = useTheme2();

  /**
   * States
   */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Close Popup
   */
  const onClosePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Ref
   */
  const ref = useRef<HTMLButtonElement | null>(null);

  return (
    <button onClick={() => setIsOpen(true)} ref={ref} className={styles.filterButton}>
      <Icon
        name="filter"
        style={{
          color: header.column.getIsFiltered() ? theme.colors.primary.text : theme.colors.secondary.text,
        }}
      />
      {isOpen && ref.current && (
        <>
          <Popover
            show={true}
            content={<FilterPopup header={header} onClose={onClosePopup} />}
            referenceElement={ref.current}
            placement="bottom-start"
          />
        </>
      )}
    </button>
  );
};
