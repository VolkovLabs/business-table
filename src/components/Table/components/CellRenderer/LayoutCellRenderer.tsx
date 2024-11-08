import { textUtil } from '@grafana/data';
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
}

/**
 * Layout Cell Renderer
 * @param value
 */
export const LayoutCellRenderer: React.FC<Props> = ({ value }) => {
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
      {...TEST_IDS.layoutCellRenderer.root.apply()}
      dangerouslySetInnerHTML={{ __html: textUtil.sanitize(md.render(replaceVariables(value))) }}
    />
  );
};
