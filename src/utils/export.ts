/**
 * Format for replaceVariables
 * @param original
 * @param variable
 * @param data
 */
export const format = (original: unknown, variable: { name?: string }, data: unknown[][]) => {
  if (variable && variable?.name === 'payload') {
    const prettyData = JSON.stringify(data, null, 4);
    const escapedString = prettyData.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return escapedString;
  }

  return original;
};
