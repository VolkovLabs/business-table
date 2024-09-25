import { InterpolateFunction } from '@grafana/data';
import MarkdownIt from 'markdown-it';
import React from 'react';

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
 * Nested Object Card Content
 */
export const NestedObjectCardContent: React.FC<Props> = ({ text, replaceVariables }) => {
  return <div dangerouslySetInnerHTML={{ __html: md.render(replaceVariables(text)) }} />;
};
