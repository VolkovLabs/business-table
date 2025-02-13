import { useEffect, useRef, useState } from 'react';

import { PanelOptions, RowHighlightConfig, ScrollToRowPosition } from '@/types';

/**
 * Content Sizes
 */
export const useContentSizes = ({
  tableData,
  width,
  height,
  options,
  rowHighlightConfig,
}: {
  tableData: unknown[];
  width: number;
  height: number;
  options: PanelOptions;
  rowHighlightConfig?: RowHighlightConfig;
}) => {
  /**
   * Refs
   */
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null);
  const tableFooterRef = useRef<HTMLTableSectionElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  /**
   * States
   */
  const [tableTopOffset, setTableTopOffset] = useState(0);
  const [tableBottomOffset, setTableBottomOffset] = useState(0);
  const [scrollPaddingEnd, setScrollPaddingEnd] = useState(0);
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

      /**
       * Need for scroll position end
       * https://tanstack.com/virtual/v3/docs/api/virtualizer#scrolltoindex
       * for some reason, scrolling to the end does not count
       * the location of the toolbar, the table header and its footer
       *
       */
      if (
        rowHighlightConfig?.enabled &&
        !!rowHighlightConfig?.scrollTo &&
        rowHighlightConfig?.scrollTo === ScrollToRowPosition.END
      ) {
        /**
         * Calculate padding
         */
        let paddingEnd = 0;

        if (headerRef.current) {
          paddingEnd += headerRef.current.clientHeight;
        }

        if (tableHeaderRef.current) {
          paddingEnd += tableHeaderRef.current.clientHeight;
        }

        if (tableFooterRef.current) {
          paddingEnd += tableFooterRef.current.clientHeight;
        }
        console.log('paddingEnd', paddingEnd);
        setScrollPaddingEnd(paddingEnd);
      }
    }
  }, [
    tableData,
    height,
    options.tables,
    width,
    options.toolbar.export,
    rowHighlightConfig?.enabled,
    rowHighlightConfig?.scrollTo,
  ]);

  return {
    containerRef,
    headerRef,
    tableRef,
    tableHeaderRef,
    tableTopOffset,
    tableBottomOffset,
    paginationRef,
    tableFooterRef,
    scrollPaddingEnd,
  };
};
