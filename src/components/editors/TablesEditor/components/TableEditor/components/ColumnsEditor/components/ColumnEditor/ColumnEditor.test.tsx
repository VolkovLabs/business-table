import { toDataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { Select, StatsPicker } from '@grafana/ui';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { tablesEditorContext } from '@/hooks';
import { CellAggregation, CellType, ColumnAlignment, ColumnFilterMode, ColumnPinDirection } from '@/types';
import {
  createColumnAppearanceConfig,
  createColumnConfig,
  createColumnFilterConfig,
  createColumnSortConfig,
  createNestedObjectConfig,
  createVariable,
} from '@/utils';

import { ColumnEditor } from './ColumnEditor';

type Props = React.ComponentProps<typeof ColumnEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  footerEditor: createSelector('data-testid footer-editor'),
};

describe('ColumnEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.columnEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Data
   */
  const frame = toDataFrame({
    fields: [
      {
        name: 'device',
      },
    ],
  });

  /**
   * Get component
   */
  const getComponent = ({
    contextValue,
    ...restProps
  }: Partial<Props> & { contextValue?: ReturnType<typeof tablesEditorContext.useContext> }) => {
    return (
      <tablesEditorContext.Provider value={contextValue || { nestedObjects: [] }}>
        <ColumnEditor
          value={createColumnConfig()}
          onChange={onChange}
          data={[frame]}
          isAggregationAvailable={false}
          {...(restProps as any)}
        />
      </tablesEditorContext.Provider>
    );
  };

  beforeEach(() => {
    jest
      .mocked(StatsPicker)
      .mockImplementation(
        ({ stats, onChange, filterOptions }: any) =>
          (
            <Select
              value={stats}
              onChange={(event) => onChange(event.map(({ value }: never) => value))}
              options={[{ value: 'min' }, { value: 'max' }, { id: 'count', value: 'count' }].filter(filterOptions)}
              isMulti={true}
              {...inTestIds.footerEditor.apply()}
            />
          ) as any
      );
  });

  it('Should allow to change label', () => {
    render(getComponent({ value: createColumnConfig({ label: '123' }) }));

    expect(selectors.fieldLabel()).toBeInTheDocument();
    expect(selectors.fieldLabel()).toHaveValue('123');

    fireEvent.change(selectors.fieldLabel(), { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'hello',
      })
    );
  });

  it('Should allow to change type', () => {
    render(getComponent({ value: createColumnConfig({ type: CellType.COLORED_TEXT }) }));

    expect(selectors.fieldType()).toBeInTheDocument();
    expect(selectors.fieldType()).toHaveValue(CellType.COLORED_TEXT);

    fireEvent.change(selectors.fieldType(), { target: { value: CellType.AUTO } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: CellType.AUTO,
      })
    );
  });

  it('Should allow to change group', () => {
    render(getComponent({ value: createColumnConfig({ group: false }) }));

    expect(selectors.fieldGroup()).toBeInTheDocument();
    expect(selectors.fieldGroup()).not.toBeChecked();

    fireEvent.click(selectors.fieldGroup());

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        group: true,
      })
    );
  });

  it('Should hide aggregation if group', () => {
    render(getComponent({ value: createColumnConfig({ group: true }) }));

    expect(selectors.fieldAggregation(true)).not.toBeInTheDocument();
  });

  it('Should hide aggregation if not available', () => {
    render(getComponent({ value: createColumnConfig({ group: false }), isAggregationAvailable: false }));

    expect(selectors.fieldAggregation(true)).not.toBeInTheDocument();
  });

  it('Should allow to change aggregation', () => {
    render(
      getComponent({
        value: createColumnConfig({ group: false, aggregation: CellAggregation.UNIQUE_COUNT }),
        isAggregationAvailable: true,
      })
    );

    expect(selectors.fieldAggregation()).toBeInTheDocument();
    expect(selectors.fieldAggregation()).toHaveValue(CellAggregation.UNIQUE_COUNT);

    fireEvent.change(selectors.fieldAggregation(), { target: { value: CellAggregation.MAX } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregation: CellAggregation.MAX,
      })
    );
  });

  describe('filter', () => {
    it('Should allow to enable filtering', () => {
      render(
        getComponent({
          value: createColumnConfig({ filter: { enabled: false, mode: ColumnFilterMode.CLIENT, variable: '' } }),
        })
      );

      expect(selectors.fieldFilterEnabled()).toBeInTheDocument();
      expect(selectors.fieldFilterEnabled()).not.toBeChecked();

      fireEvent.click(selectors.fieldFilterEnabled());

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            enabled: true,
          }),
        })
      );
    });

    it('Should hide filter fields if disabled', () => {
      render(
        getComponent({
          value: createColumnConfig({ filter: { enabled: false, mode: ColumnFilterMode.CLIENT, variable: '' } }),
        })
      );

      expect(selectors.fieldFilterEnabled()).toBeInTheDocument();
      expect(selectors.fieldFilterMode(true)).not.toBeInTheDocument();
      expect(selectors.fieldFilterVariable(true)).not.toBeInTheDocument();
    });

    it('Should allow to change filter mode', () => {
      render(
        getComponent({
          value: createColumnConfig({ filter: { enabled: true, mode: ColumnFilterMode.CLIENT, variable: '' } }),
        })
      );

      expect(selectors.fieldFilterMode()).toBeInTheDocument();
      expect(selectors.fieldFilterMode()).toHaveValue(ColumnFilterMode.CLIENT);

      fireEvent.change(selectors.fieldFilterMode(), { target: { value: ColumnFilterMode.QUERY } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            mode: ColumnFilterMode.QUERY,
          }),
        })
      );
    });

    it('Should allow to select supported variable for query filter', () => {
      jest.mocked(getTemplateSrv().getVariables).mockReturnValue([
        createVariable({
          name: 'var1',
          type: 'textbox',
        }),
      ]);

      render(
        getComponent({
          value: createColumnConfig({ filter: { enabled: true, mode: ColumnFilterMode.QUERY, variable: '' } }),
        })
      );

      expect(selectors.fieldFilterVariable()).toBeInTheDocument();
      expect(selectors.fieldFilterVariable()).toHaveValue('');

      fireEvent.change(selectors.fieldFilterVariable(), { target: { value: 'var1' } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            variable: 'var1',
          }),
        })
      );
    });

    it('Should disallow to select unsupported variable for query filter', () => {
      jest.mocked(getTemplateSrv().getVariables).mockReturnValue([
        createVariable({
          name: 'var1',
          type: 'datasource',
        }),
      ]);

      render(
        getComponent({
          value: createColumnConfig({ filter: { enabled: true, mode: ColumnFilterMode.QUERY, variable: '' } }),
        })
      );

      expect(selectors.fieldFilterVariable()).toBeInTheDocument();
      expect(selectors.fieldFilterVariable()).toHaveValue('');

      fireEvent.change(selectors.fieldFilterVariable(), { target: { value: 'var1' } });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('sort', () => {
    it('Should allow to enable sorting', () => {
      render(
        getComponent({
          value: createColumnConfig({ sort: { enabled: false, descFirst: false } }),
        })
      );

      expect(selectors.fieldSortEnabled()).toBeInTheDocument();
      expect(selectors.fieldSortEnabled()).not.toBeChecked();

      fireEvent.click(selectors.fieldSortEnabled());

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: expect.objectContaining({
            enabled: true,
          }),
        })
      );
    });
  });

  describe('appearance', () => {
    describe('colored background', () => {
      it('Should allow to change apply to row', () => {
        render(getComponent({ value: createColumnConfig({ type: CellType.COLORED_BACKGROUND }) }));

        expect(selectors.fieldAppearanceBackgroundApplyToRow()).toBeInTheDocument();

        fireEvent.click(selectors.fieldAppearanceBackgroundApplyToRow());

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            appearance: expect.objectContaining({
              background: expect.objectContaining({
                applyToRow: true,
              }),
            }),
          })
        );
      });

      it('Should not allow to change apply to row if different type', () => {
        render(getComponent({ value: createColumnConfig({ type: CellType.COLORED_TEXT }) }));

        expect(selectors.fieldAppearanceBackgroundApplyToRow(true)).not.toBeInTheDocument();
      });
    });

    describe('width', () => {
      it('Should allow to change width auto', () => {
        render(
          getComponent({
            value: createColumnConfig({
              appearance: createColumnAppearanceConfig({
                width: {
                  auto: false,
                  value: 100,
                },
              }),
            }),
          })
        );

        expect(selectors.fieldAppearanceWidthAuto()).toBeInTheDocument();

        fireEvent.click(selectors.fieldAppearanceWidthAuto());

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            appearance: expect.objectContaining({
              width: expect.objectContaining({
                auto: true,
              }),
            }),
          })
        );
      });

      it('Should allow to change min width if auto', () => {
        render(
          getComponent({
            value: createColumnConfig({
              appearance: createColumnAppearanceConfig({
                width: {
                  auto: true,
                  min: 0,
                  value: 100,
                },
              }),
            }),
          })
        );

        expect(selectors.fieldAppearanceWidthMin()).toBeInTheDocument();

        fireEvent.change(selectors.fieldAppearanceWidthMin(), { target: { value: '50' } });
        fireEvent.blur(selectors.fieldAppearanceWidthMin(), { target: { value: '50' } });

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            appearance: expect.objectContaining({
              width: expect.objectContaining({
                min: 50,
              }),
            }),
          })
        );
      });

      it('Should allow to change max width if auto', () => {
        render(
          getComponent({
            value: createColumnConfig({
              appearance: createColumnAppearanceConfig({
                width: {
                  auto: true,
                  max: 0,
                  value: 100,
                },
              }),
            }),
          })
        );

        expect(selectors.fieldAppearanceWidthMax()).toBeInTheDocument();

        fireEvent.change(selectors.fieldAppearanceWidthMax(), { target: { value: '50' } });
        fireEvent.blur(selectors.fieldAppearanceWidthMax(), { target: { value: '50' } });

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            appearance: expect.objectContaining({
              width: expect.objectContaining({
                max: 50,
              }),
            }),
          })
        );
      });

      it('Should allow to reset max width', () => {
        render(
          getComponent({
            value: createColumnConfig({
              appearance: createColumnAppearanceConfig({
                width: {
                  auto: true,
                  max: 150,
                  value: 100,
                },
              }),
            }),
          })
        );

        expect(selectors.fieldAppearanceWidthMax()).toBeInTheDocument();

        fireEvent.change(selectors.fieldAppearanceWidthMax(), { target: { value: '0' } });
        fireEvent.blur(selectors.fieldAppearanceWidthMax(), { target: { value: '0' } });

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            appearance: expect.objectContaining({
              width: expect.objectContaining({
                max: undefined,
              }),
            }),
          })
        );
      });

      it('Should allow to change width value if not auto', () => {
        render(
          getComponent({
            value: createColumnConfig({
              appearance: createColumnAppearanceConfig({
                width: {
                  auto: false,
                  value: 100,
                },
              }),
            }),
          })
        );

        expect(selectors.fieldAppearanceWidthValue()).toBeInTheDocument();

        fireEvent.change(selectors.fieldAppearanceWidthValue(), { target: { value: '150' } });
        fireEvent.blur(selectors.fieldAppearanceWidthValue(), { target: { value: '150' } });

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            appearance: expect.objectContaining({
              width: expect.objectContaining({
                value: 150,
              }),
            }),
          })
        );
      });
    });

    describe('wrap', () => {
      it('Should allow to change value', () => {
        render(
          getComponent({
            value: createColumnConfig({
              appearance: createColumnAppearanceConfig({
                wrap: false,
              }),
            }),
          })
        );

        expect(selectors.fieldAppearanceWrap()).toBeInTheDocument();

        fireEvent.click(selectors.fieldAppearanceWrap());

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            appearance: expect.objectContaining({
              wrap: true,
            }),
          })
        );
      });
    });

    describe('alignment', () => {
      it('Should allow to change value', () => {
        render(
          getComponent({
            value: createColumnConfig({
              appearance: createColumnAppearanceConfig({
                alignment: ColumnAlignment.START,
              }),
            }),
          })
        );

        expect(selectors.fieldAppearanceAlignment()).toBeInTheDocument();

        fireEvent.click(selectors.fieldAppearanceAlignmentOption(false, ColumnAlignment.CENTER));

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            appearance: expect.objectContaining({
              alignment: ColumnAlignment.CENTER,
            }),
          })
        );
      });
    });
  });

  it('Should allow to change footer', () => {
    render(
      getComponent({
        value: createColumnConfig(),
      })
    );

    expect(selectors.footerEditor()).toBeInTheDocument();

    fireEvent.change(selectors.footerEditor(), { target: { values: ['max'] } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        footer: ['max'],
      })
    );
  });

  it('Should allow to enable pinning', () => {
    render(
      getComponent({
        value: createColumnConfig({ pin: ColumnPinDirection.NONE }),
      })
    );

    expect(selectors.fieldPinDirection()).toBeInTheDocument();
    expect(selectors.fieldPinDirection()).not.toBeChecked();

    fireEvent.click(selectors.pinDirectionOption(false, ColumnPinDirection.LEFT));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pin: ColumnPinDirection.LEFT,
      })
    );
  });

  it('Should allow to set sort direction', () => {
    render(
      getComponent({
        value: createColumnConfig({
          sort: {
            enabled: true,
            descFirst: false,
          },
        }),
      })
    );

    expect(selectors.fieldSortDirection()).toBeInTheDocument();
    expect(selectors.fieldSortDirection()).not.toBeChecked();

    fireEvent.click(selectors.sortDirectionOption(false, 'desc'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: {
          enabled: true,
          descFirst: true,
        },
      })
    );
  });

  describe('Nested Objects', () => {
    it('Should allow to change object id', () => {
      const nestedObject = createNestedObjectConfig({ id: 'hello', name: 'Hello' });

      render(
        getComponent({
          contextValue: { nestedObjects: [nestedObject] },
          value: createColumnConfig({
            type: CellType.NESTED_OBJECTS,
          }),
        })
      );

      expect(selectors.fieldObjectId()).toBeInTheDocument();

      fireEvent.change(selectors.fieldObjectId(), { target: { value: nestedObject.id } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          objectId: nestedObject.id,
        })
      );
    });

    it('Should disable unavailable options if nested objects', () => {
      render(
        getComponent({
          value: createColumnConfig({
            type: CellType.COLORED_TEXT,
            filter: createColumnFilterConfig({
              enabled: true,
            }),
            sort: createColumnSortConfig({
              enabled: true,
            }),
            group: true,
            footer: ['min'],
          }),
        })
      );

      fireEvent.change(selectors.fieldType(), { target: { value: CellType.NESTED_OBJECTS } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: CellType.NESTED_OBJECTS,
          filter: expect.objectContaining({
            enabled: false,
          }),
          sort: expect.objectContaining({
            enabled: true,
          }),
          footer: [],
          group: false,
        })
      );
    });

    it('Should not allow to enable unavailable options', () => {
      render(
        getComponent({
          value: createColumnConfig({
            type: CellType.NESTED_OBJECTS,
          }),
        })
      );

      expect(selectors.fieldFilterEnabled(true)).not.toBeInTheDocument();
      expect(selectors.fieldGroup(true)).not.toBeInTheDocument();
      expect(selectors.fieldAppearanceWrap(true)).not.toBeInTheDocument();
    });
  });
});
