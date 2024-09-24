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
