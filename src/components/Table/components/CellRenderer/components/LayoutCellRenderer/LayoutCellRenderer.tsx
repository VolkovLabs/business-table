import { textUtil } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
import { Row } from '@tanstack/react-table';
import MarkdownIt from 'markdown-it';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { tablePanelContext } from '@/hooks';

/**
 * Properties
 */
interface Props {
  /**
   * Value
   *
   * @type {string }
   */
  value: string;

  /**
   * Row
   *
   * @type {string }
   */
  row: Row<unknown>;

  /**
   * Background Color
   *
   * @type {string}
   */
  bgColor?: string;
}

/**
 * Layout Cell Renderer
 * @param value
 * @param row
 */
export const LayoutCellRenderer: React.FC<Props> = ({ value, row, bgColor }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();

  /**
   * Scoped Vars
   */
  const scopedVars = {
    row: {
      value: row.original,
    },
  };

  /**
   * Markdown it
   */
  const md = new MarkdownIt({
    html: true,
  });

  /**
   * Context
   */

  const { replaceVariables } = tablePanelContext.useContext();

  return (
    <div
      style={{
        color: bgColor ? theme.colors.getContrastText(bgColor) : 'inherit',
      }}
      {...TEST_IDS.layoutCellRenderer.root.apply()}
      dangerouslySetInnerHTML={{ __html: textUtil.sanitize(md.render(replaceVariables(value, scopedVars))) }}
    />
  );
};
