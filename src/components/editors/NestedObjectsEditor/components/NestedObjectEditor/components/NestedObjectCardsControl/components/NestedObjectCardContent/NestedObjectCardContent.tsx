import { InterpolateFunction } from '@grafana/data';
import MarkdownIt from 'markdown-it';
import React from 'react';

import { TEST_IDS } from '@/constants';

/**
 * Properties
 */
interface Props {
  /**
   * Text
   *
   * @type {string}
   */
  text: string;

  /**
   * Replace Variables
   *
   * @type {InterpolateFunction}
   */
  replaceVariables: InterpolateFunction;
}

/**
 * Markdown it
 */
const md = new MarkdownIt({
  html: true,
});

/**
 * Test Ids
 */
const testIds = TEST_IDS.nestedObjectCardContent;

/**
 * Nested Object Card Content
 */
export const NestedObjectCardContent: React.FC<Props> = ({ text, replaceVariables }) => {
  return <div {...testIds.root.apply()} dangerouslySetInnerHTML={{ __html: md.render(replaceVariables(text)) }} />;
};
