/**
 * Editor Props
 */
export interface EditorProps<TValue> {
  /**
   * Value
   */
  value: TValue;

  /**
   * Change
   */
  onChange: (value: TValue) => void;
}

/**
 * Supported Languages
 */
export const enum CodeLanguage {
  HANDLEBARS = 'handlebars',
  MARKDOWN = 'markdown',
  JSON = 'json',
}
