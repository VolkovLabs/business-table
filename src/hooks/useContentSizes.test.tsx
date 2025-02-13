import { render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { RowHighlightConfig, ScrollToRowPosition } from '@/types';
import { createRowHighlightConfig, createToolbarOptions } from '@/utils';

import { useContentSizes } from './useContentSizes';
/**
 * In Test Ids
 */
const inTestIds = {
  container: createSelector('data-testid container'),
  header: createSelector('data-testid header'),
  tableHeader: createSelector('data-testid table-header'),
  tableBody: createSelector('data-testid table-body'),
  tableFooter: createSelector('data-testid table-footer'),
  pagination: createSelector('data-testid pagination'),
};

/**
 * Props
 */
type Props = {
  width: number;
  height: number;
  rowHighlight: RowHighlightConfig;
  options: any;
  data: unknown[];
};
describe('useContentSizes', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...inTestIds });
  const selectors = getSelectors(screen);

  beforeEach(() => {
    /**
     * jsdom doesn't support layout. This means measurements like clientHeight will always return 0
     * https://github.com/testing-library/react-testing-library/issues/353
     */
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 50 });
  });

  /**
   * Tested Component
   */
  const Component = (props: Props) => {
    const { width, height, rowHighlight, options, data } = props;

    /**
     * Content Sizes
     */
    const {
      containerRef,
      tableRef,
      headerRef,
      tableTopOffset,
      tableHeaderRef,
      paginationRef,
      tableBottomOffset,
      tableFooterRef,
      scrollPaddingEnd,
    } = useContentSizes({ width, height, options, tableData: data, rowHighlightConfig: rowHighlight });

    return (
      <div ref={containerRef} style={{ width: props.width, height: props.height }} {...inTestIds.container.apply()}>
        <div ref={headerRef} {...inTestIds.header.apply()} data-height="50" style={{ height: 25 }} />
        <div ref={tableHeaderRef} {...inTestIds.tableHeader.apply()} style={{ top: tableTopOffset, height: 25 }} />
        <div ref={tableRef} {...inTestIds.tableBody.apply()} style={{ paddingBottom: scrollPaddingEnd, height: 25 }} />
        <div ref={tableFooterRef} {...inTestIds.tableFooter.apply()} style={{ bottom: tableBottomOffset }} />
        <div ref={paginationRef} {...inTestIds.pagination.apply()} />
      </div>
    );
  };

  /**
   * Get Component
   */
  const getComponent = (props: Props) => {
    return <Component {...(props as any)} />;
  };

  it('Should calculate scrollPaddingEnd for scroll to end option', () => {
    render(
      getComponent({
        width: 200,
        height: 400,
        options: {
          toolbar: createToolbarOptions({}),
        },
        data: [],
        rowHighlight: createRowHighlightConfig({
          enabled: true,
          scrollTo: ScrollToRowPosition.END,
        }),
      })
    );

    expect(selectors.tableBody()).toHaveStyle({ paddingBottom: '150px' });
  });

  it('Should not calculate scrollPaddingEnd for scroll to end option if disabled', () => {
    render(
      getComponent({
        width: 200,
        height: 400,
        options: {
          toolbar: createToolbarOptions({}),
        },
        data: [],
        rowHighlight: createRowHighlightConfig({
          enabled: true,
          scrollTo: ScrollToRowPosition.NONE,
        }),
      })
    );

    expect(selectors.tableBody()).not.toHaveStyle({ paddingBottom: '150px' });
  });
});
