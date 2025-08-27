import handlebars from 'handlebars';

/**
 * Format for replaceVariables
 * @param original
 * @param variable
 * @param data
 */
export const format = (original: unknown, variable: { name?: string }, data: unknown[][]) => {
  if (variable && variable?.name === 'payload') {
    const prettyData = JSON.stringify(data);
    const escapedString = prettyData.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return escapedString;
  }

  return original;
};

/**
 * Format transformNestedData
 * @param transformHelper
 * @param data
 */
export const transformNestedData = (transformHelper: string, data: unknown[]) => {
  /**
   * Handlebars
   */
  if (data.length < 1) {
    return data;
  }

  const template = handlebars.compile(transformHelper);
  return template(data);
};
