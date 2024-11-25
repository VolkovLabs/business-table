import { Column } from '@tanstack/react-table';
import { Base64 } from 'js-base64';
import React from 'react';

import { BASE64_IMAGE_HEADER_REGEX, IMAGE_TYPES_SYMBOLS, TEST_IDS } from '@/constants';

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
   * Column
   *
   * @type {string }
   */
  column: Column<unknown>;
}

/**
 * Image Cell Renderer
 * @param value
 * @param column
 */
export const ImageCellRenderer: React.FC<Props> = ({ value, column }) => {
  /**
   * Source
   */
  let source = value;

  if (value && Base64.isValid(value)) {
    const mediaMatch = value.match(BASE64_IMAGE_HEADER_REGEX);
    if (!mediaMatch?.length) {
      /**
       * Set header
       */
      const type = IMAGE_TYPES_SYMBOLS[value.charAt(0)];
      source = type ? `data:${type};base64,${source}` : `data:;base64,${source}`;
    }
  }

  return (
    <img
      src={source}
      alt=""
      style={{
        maxWidth: column.columnDef.maxSize,
        minWidth: column.columnDef.minSize,
        width: column.getSize(),
        imageRendering: column.columnDef.meta?.scale,
      }}
      {...TEST_IDS.imageCellRenderer.root.apply()}
    />
  );
};
