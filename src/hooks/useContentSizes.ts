import { useEffect, useRef, useState } from 'react';

import { PanelOptions } from '@/types';

/**
 * Content Sizes
 */
export const useContentSizes = ({
  tableData,
  width,
  height,
  options,
}: {
  tableData: unknown[];
  width: number;
  height: number;
  options: PanelOptions;
}) => {
  /**
   * Refs
   */
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  /**
   * States
   */
  const [tableTopOffset, setTableTopOffset] = useState(0);
  const [tableBottomOffset, setTableBottomOffset] = useState(0);

  /**
   * Calculate table offset
   */
  useEffect(() => {
    if (containerRef.current) {
      let topOffset = 0;
      if (headerRef.current) {
        topOffset += headerRef.current.clientHeight;
      }

      let bottomOffset = 0;
      if (paginationRef.current) {
        bottomOffset += paginationRef.current.clientHeight;
      }

      setTableTopOffset(topOffset);
      setTableBottomOffset(bottomOffset);
    }
  }, [tableData, height, options.tables, width]);

  return {
    containerRef,
    headerRef,
    tableRef,
    tableHeaderRef,
    tableTopOffset,
    tableBottomOffset,
    paginationRef,
  };
};
