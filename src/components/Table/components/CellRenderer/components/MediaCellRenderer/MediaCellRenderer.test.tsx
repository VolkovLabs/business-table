import { Column } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ColumnMeta, ImageScale } from '@/types';
import { createColumnConfig } from '@/utils';

import { MediaCellRenderer } from './MediaCellRenderer';

type Props = React.ComponentProps<typeof MediaCellRenderer>;

describe('MediaCellRenderer', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.mediaCellRenderer);
  const selectors = getSelectors(screen);

  /**
   * Create Column With Meta
   */
  const createColumnWithMeta = (meta: Partial<ColumnMeta>): Column<any> =>
    ({
      getSize: () => 100,
      columnDef: {
        meta,
      },
    }) as any;

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <MediaCellRenderer {...(props as any)} />;
  };

  /**
   * Column Default
   */
  const columnDefault = createColumnWithMeta({
    config: createColumnConfig({ type: 'abc' as any }),
    scale: ImageScale.AUTO,
  });

  it('Should render value', () => {
    render(getComponent({ value: '', column: columnDefault as any }));

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should render value with url', () => {
    render(getComponent({ value: 'https://text/com', column: columnDefault as any }));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveAttribute('src', 'https://text/com');
  });

  it('Should render value with base64 and add type header', () => {
    render(
      getComponent({
        value:
          'iVBORw0KGgoAAAANSUhEUgAAANgAAADqCAYAAADAkotLAAAAAXNSR0IArs4c6QAA AFBlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6AB',
        column: columnDefault as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveAttribute(
      'src',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANgAAADqCAYAAADAkotLAAAAAXNSR0IArs4c6QAA AFBlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6AB'
    );
  });

  it('Should render value with base64 and add type header and none-image type', () => {
    render(
      getComponent({
        value:
          'xVBORw0KGgoAAAANSUhEUgAAANgAAADqCAYAAADAkotLAAAAAXNSR0IArs4c6QAA AFBlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6AB',
        column: columnDefault as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveAttribute(
      'src',
      'data:;base64,xVBORw0KGgoAAAANSUhEUgAAANgAAADqCAYAAADAkotLAAAAAXNSR0IArs4c6QAA AFBlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6AB'
    );
  });
});
