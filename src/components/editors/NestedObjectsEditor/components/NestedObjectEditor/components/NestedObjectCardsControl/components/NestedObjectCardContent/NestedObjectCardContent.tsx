import { InterpolateFunction } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import MarkdownIt from 'markdown-it';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { getStyles } from './NestedObjectCardContent.styles';

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
  const styles = useStyles2(getStyles);
  return (
    <div
      {...testIds.root.apply()}
      className={styles.root}
      dangerouslySetInnerHTML={{ __html: md.render(replaceVariables(text)) }}
    />
  );
};
