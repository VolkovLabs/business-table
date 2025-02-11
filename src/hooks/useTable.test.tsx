import { EventBusSrv, FieldType, OrgRole, ReducerID, toDataFrame } from '@grafana/data';
import { act, renderHook } from '@testing-library/react';

import { ACTIONS_COLUMN_ID, ROW_HIGHLIGHT_STATE_KEY } from '@/constants';
import {
  CellAggregation,
  CellType,
  ColumnEditorType,
  ColumnFilterMode,
  ColumnFilterType,
  ColumnPinDirection,
  NestedObjectType,
  PermissionMode,
} from '@/types';
import {
  columnFilter,
  createActionsColumnConfig,
  createColumnAppearanceConfig,
  createColumnConfig,
  createColumnEditConfig,
  createColumnNewRowEditConfig,
  createNestedObjectConfig,
  createNestedObjectOperationConfig,
  createPermissionConfig,
  createRowHighlightConfig,
  createTableRequestConfig,
  createVariable,
  FooterContext,
  getColumnDefValue,
} from '@/utils';

import { useNestedObjects } from './useNestedObjects';
import { useRuntimeVariables } from './useRuntimeVariables';
import { useTable } from './useTable';

/**
 * Mock useNestedObjects
 */
jest.mock('./useNestedObjects', () => ({
  useNestedObjects: jest.fn(() => ({
    onLoad: jest.fn(),
    getValuesForColumn: jest.fn(),
    loadingState: {},
  })),
}));

/**
 * Mock useRuntimeVariables
 */
const runtimeVariablesMock = {
  getVariable: jest.fn(),
};
jest.mock('./useRuntimeVariables', () => ({
  useRuntimeVariables: jest.fn(() => runtimeVariablesMock),
}));

describe('useTable', () => {
  /**
   * Defaults
   */
  const eventBus = new EventBusSrv();
  const replaceVariables = (str: string) => str;

  /**
   * Frame
   */
  const refId = 'A';
  const frame = toDataFrame({
    refId,
    fields: [
      {
        name: 'device',
        values: ['device1', 'device2'],
      },
      {
        name: 'value',
        values: [10, 20],
      },
      {
        name: 'created',
        type: FieldType.time,
        values: [new Date().valueOf(), new Date().valueOf()],
      },
      {
        name: 'other',
        type: FieldType.other,
        values: ['a', 'b'],
      },
      {
        name: 'unused',
        values: [11, 22],
      },
      {
        name: 'comments',
        values: [[1, 2], [3]],
      },
      {
        name: 'nested.value',
        values: ['nested1', 'nested2'],
      },
    ],
  });

  /**
   * NestedObjects Mock
   */
  const nestedObjectsMock = {
    onLoad: jest.fn(),
    getValuesForColumn: jest.fn(),
    loadingState: {},
  };

  const actionsColumnConfigDefault = createActionsColumnConfig({});

  beforeEach(() => {
    jest.mocked(useNestedObjects).mockReturnValue(nestedObjectsMock);
    jest.mocked(useRuntimeVariables).mockReturnValue(runtimeVariablesMock as never);
  });

  it('Should return table data for configured columns', () => {
    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [
          createColumnConfig({
            field: {
              source: refId,
              name: 'device',
            },
          }),
          createColumnConfig({
            field: {
              source: refId,
              name: 'value',
            },
          }),
          /**
           * Check if data presents for hidden column
           */
          createColumnConfig({
            enabled: false,
            field: {
              source: refId,
              name: 'other',
            },
          }),
        ],
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.tableData).toEqual([
      {
        device: frame.fields[0].values[0],
        value: frame.fields[1].values[0],
        other: frame.fields[3].values[0],
      },
      {
        device: frame.fields[0].values[1],
        value: frame.fields[1].values[1],
        other: frame.fields[3].values[1],
      },
    ]);
  });

  it('Should return table data if no refId', () => {
    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [
            {
              ...frame,
              refId: undefined,
            },
          ],
        } as any,
        columns: [
          createColumnConfig({
            field: {
              source: 0,
              name: 'device',
            },
          }),
          createColumnConfig({
            field: {
              source: 0,
              name: 'value',
            },
          }),
        ],
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.tableData).toEqual([
      {
        device: frame.fields[0].values[0],
        value: frame.fields[1].values[0],
      },
      {
        device: frame.fields[0].values[1],
        value: frame.fields[1].values[1],
      },
    ]);
  });

  it('Should work if no data frame', () => {
    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [],
        } as any,
        columns: [
          createColumnConfig({
            field: {
              source: refId,
              name: 'device',
            },
          }),
          createColumnConfig({
            field: {
              source: refId,
              name: 'value',
            },
          }),
        ],
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.tableData).toEqual([]);
  });

  it('Should work if no columns', () => {
    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [],
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.tableData).toEqual([]);
  });

  it('Should work if columns not defined', () => {
    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: undefined,
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.tableData).toEqual([]);
  });

  it('Should return columns from config', () => {
    const deviceColumn = createColumnConfig({
      label: 'Device',
      field: {
        source: refId,
        name: 'device',
      },
      group: true,
      aggregation: CellAggregation.UNIQUE_COUNT,
    });
    const valueColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'value',
      },
      group: false,
      aggregation: CellAggregation.NONE,
    });
    const nestedColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'nested.value',
      },
    });
    const disabledColumn = createColumnConfig({
      enabled: false,
      field: {
        source: refId,
        name: 'other',
      },
    });

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn, valueColumn, nestedColumn, disabledColumn],
        objects: [],
        replaceVariables,
        actionsColumnConfig: createActionsColumnConfig(),
        eventBus,
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        header: deviceColumn.label,
        cell: expect.any(Function),
        enableGrouping: deviceColumn.group,
        aggregationFn: deviceColumn.aggregation,
      }),
      expect.objectContaining({
        id: valueColumn.field.name,
        header: frame.fields[1].name,
        cell: expect.any(Function),
        enableGrouping: valueColumn.group,
        aggregationFn: expect.any(Function),
      }),
      expect.objectContaining({
        id: nestedColumn.field.name,
        header: 'nested.value',
        cell: expect.any(Function),
        enableGrouping: valueColumn.group,
        aggregationFn: expect.any(Function),
      }),
    ]);

    /**
     * Check accessorFn returns column data
     */
    expect(getColumnDefValue(result.current.columns[0], result.current.tableData[0])).toEqual('device1');
    expect(getColumnDefValue(result.current.columns[1], result.current.tableData[0])).toEqual(10);
    expect(getColumnDefValue(result.current.columns[2], result.current.tableData[0])).toEqual('nested1');

    /**
     * Check if none aggregation returns nothing
     */
    expect((result.current.columns[1].aggregationFn as () => null)()).toBeNull();
  });

  it('Should build client column filters', () => {
    const deviceColumn = createColumnConfig({
      label: 'Device',
      field: {
        source: refId,
        name: 'device',
      },
      filter: {
        enabled: true,
        mode: ColumnFilterMode.CLIENT,
        variable: '',
      },
    });
    const valueColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'value',
      },
      filter: {
        enabled: true,
        mode: ColumnFilterMode.CLIENT,
        variable: '',
      },
    });
    const createdColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'created',
      },
      filter: {
        enabled: true,
        mode: ColumnFilterMode.CLIENT,
        variable: '',
      },
    });
    const otherColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'other',
      },
      filter: {
        enabled: true,
        mode: ColumnFilterMode.CLIENT,
        variable: '',
      },
    });

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn, valueColumn, createdColumn, otherColumn],
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        enableColumnFilter: true,
        filterFn: columnFilter,
        meta: expect.objectContaining({
          availableFilterTypes: [ColumnFilterType.SEARCH, ColumnFilterType.FACETED],
          filterMode: deviceColumn.filter.mode,
          filterVariableName: deviceColumn.filter.variable,
        }),
      }),
      expect.objectContaining({
        id: valueColumn.field.name,
        enableColumnFilter: true,
        filterFn: expect.any(Function),
        meta: expect.objectContaining({
          availableFilterTypes: [ColumnFilterType.NUMBER],
          filterMode: valueColumn.filter.mode,
          filterVariableName: valueColumn.filter.variable,
        }),
      }),
      expect.objectContaining({
        id: createdColumn.field.name,
        enableColumnFilter: true,
        filterFn: expect.any(Function),
        meta: expect.objectContaining({
          availableFilterTypes: [ColumnFilterType.TIMESTAMP],
          filterMode: createdColumn.filter.mode,
          filterVariableName: createdColumn.filter.variable,
        }),
      }),
      expect.objectContaining({
        id: otherColumn.field.name,
        enableColumnFilter: true,
        filterFn: expect.any(Function),
        meta: expect.objectContaining({
          availableFilterTypes: [ColumnFilterType.SEARCH, ColumnFilterType.FACETED],
          filterMode: createdColumn.filter.mode,
          filterVariableName: createdColumn.filter.variable,
        }),
      }),
    ]);

    /**
     * Check if none aggregation returns nothing
     */
    expect((result.current.columns[1].aggregationFn as () => null)()).toBeNull();
  });

  it('Should build query column filters', () => {
    const deviceColumn = createColumnConfig({
      label: 'Device',
      field: {
        source: refId,
        name: 'device',
      },
      filter: {
        enabled: true,
        mode: ColumnFilterMode.QUERY,
        variable: 'deviceVar',
      },
    });

    /**
     * Mock variables
     */
    jest.mocked(runtimeVariablesMock.getVariable).mockReturnValue(
      createVariable({
        name: deviceColumn.filter.variable,
        type: 'query',
        multi: true,
      } as never)
    );

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn],
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        enableColumnFilter: true,
        filterFn: expect.any(Function),
        meta: expect.objectContaining({
          availableFilterTypes: [ColumnFilterType.FACETED],
          filterMode: deviceColumn.filter.mode,
          filterVariableName: deviceColumn.filter.variable,
        }),
      }),
    ]);

    /**
     * Check if filter function always include value
     */
    expect((result.current.columns[0].filterFn as any)()).toBeTruthy();
  });

  it('Should build column sort', () => {
    const deviceColumn = createColumnConfig({
      label: 'Device',
      field: {
        source: refId,
        name: 'device',
      },
      sort: {
        descFirst: false,
        enabled: true,
      },
    });
    const valueColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'value',
      },
      sort: {
        descFirst: false,
        enabled: false,
      },
    });

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn, valueColumn],
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        enableSorting: true,
        sortDescFirst: false,
      }),
      expect.objectContaining({
        id: valueColumn.field.name,
        enableSorting: false,
        sortDescFirst: false,
      }),
    ]);
  });

  it('Should apply column width value', () => {
    const deviceColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'device',
      },
      appearance: createColumnAppearanceConfig({
        width: {
          auto: true,
          min: 0,
          max: 150,
          value: 0,
        },
      }),
    });
    const valueColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'value',
      },
      appearance: createColumnAppearanceConfig({
        width: {
          auto: false,
          value: 999,
        },
      }),
    });

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn, valueColumn],
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        minSize: deviceColumn.appearance.width.min,
        maxSize: deviceColumn.appearance.width.max,
      }),
      expect.objectContaining({
        id: valueColumn.field.name,
        size: valueColumn.appearance.width.value,
      }),
    ]);
  });

  it('Should apply column footer', () => {
    const deviceColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'device',
      },
      footer: [],
    });
    const valueColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'value',
      },
      footer: [ReducerID.min],
    });

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn, valueColumn],
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        meta: expect.objectContaining({
          footerEnabled: false,
        }),
      }),
      expect.objectContaining({
        id: valueColumn.field.name,
        meta: expect.objectContaining({
          footerEnabled: true,
        }),
      }),
    ]);

    const footer = result.current.columns[1].footer;

    expect(footer).toBeInstanceOf(Function);

    if (typeof footer === 'function') {
      expect(
        footer(
          new FooterContext(valueColumn.field.name).setRows([
            {
              value: 10,
            },
            { value: 20 },
          ]) as any
        )
      ).toEqual('10');
    }
  });

  describe('editable', () => {
    it('Should enable editor if edit enabled', () => {
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
        edit: createColumnEditConfig({
          enabled: true,
          permission: {
            mode: PermissionMode.ALLOWED,
            userRole: [],
            field: { source: '', name: '' },
          },
          editor: {
            type: ColumnEditorType.STRING,
          },
        }),
      });

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          columns: [deviceColumn],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          eventBus,
        })
      );

      expect(result.current.columns[0].meta).toEqual(
        expect.objectContaining({
          editable: true,
          editor: {
            type: ColumnEditorType.STRING,
          },
        })
      );

      /**
       * Check actions column presence
       */
      expect(result.current.columns[1].id).toEqual(ACTIONS_COLUMN_ID);
    });

    it('Should enable editor if edit enabled with column', () => {
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
        edit: createColumnEditConfig({
          enabled: true,
          permission: {
            mode: PermissionMode.ALLOWED,
            userRole: [],
            field: { source: '', name: '' },
          },
          editor: {
            type: ColumnEditorType.STRING,
          },
        }),
      });

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          columns: [deviceColumn],
          objects: [],
          replaceVariables,
          actionsColumnConfig: createActionsColumnConfig({
            width: {
              auto: true,
              min: 100,
              max: 250,
              value: 0,
            },
            label: 'Actions',
            fontSize: undefined,
          }),
          eventBus,
        })
      );

      expect(result.current.columns[0].meta).toEqual(
        expect.objectContaining({
          editable: true,
          editor: {
            type: ColumnEditorType.STRING,
          },
        })
      );

      /**
       * Check actions column presence
       */
      expect(result.current.columns[1].id).toEqual(ACTIONS_COLUMN_ID);

      /**
       * Check meta Config
       */
      expect(result.current.columns[1].meta?.config).toEqual(
        expect.objectContaining({
          appearance: { alignment: 'start', header: { fontSize: 'lg' } },
        })
      );
    });

    it('Should enable add row editor if add enabled', () => {
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
        edit: createColumnEditConfig({
          enabled: false,
        }),
        newRowEdit: createColumnNewRowEditConfig({
          enabled: true,
        }),
      });

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          isAddRowEnabled: true,
          columns: [deviceColumn],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          eventBus,
        })
      );

      expect(result.current.columns[0].meta).toEqual(
        expect.objectContaining({
          addRowEditable: true,
          addRowEditor: {
            type: ColumnEditorType.STRING,
          },
        })
      );

      /**
       * Check actions column presence
       */
      expect(result.current.columns[1].id).toEqual(ACTIONS_COLUMN_ID);
    });

    it('Should enable delete row if delete enabled', () => {
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
        edit: createColumnEditConfig({
          enabled: false,
        }),
        newRowEdit: createColumnNewRowEditConfig({
          enabled: false,
        }),
      });

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          isAddRowEnabled: false,
          isDeleteRowEnabled: true,
          columns: [deviceColumn],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          eventBus,
        })
      );

      expect(result.current.columns[0].meta).toEqual(
        expect.objectContaining({
          editable: false,
          editor: undefined,
          addRowEditable: false,
          addRowEditor: undefined,
        })
      );

      /**
       * Check actions column presence
       */
      expect(result.current.columns[1].id).toEqual(ACTIONS_COLUMN_ID);
    });

    it('Should make editor column pinned if right pinned columns present', () => {
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
        edit: createColumnEditConfig({
          enabled: true,
          permission: {
            mode: PermissionMode.ALLOWED,
            userRole: [],
            field: { source: '', name: '' },
          },
          editor: {
            type: ColumnEditorType.STRING,
          },
        }),
        pin: ColumnPinDirection.RIGHT,
      });

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          columns: [deviceColumn],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          eventBus,
        })
      );

      expect(result.current.columns[0].meta).toEqual(
        expect.objectContaining({
          editable: true,
          editor: {
            type: ColumnEditorType.STRING,
          },
        })
      );

      /**
       * Check actions column is pinned
       */
      expect(result.current.columns[1].id).toEqual(ACTIONS_COLUMN_ID);
      expect(result.current.columns[1].enablePinning).toBeTruthy();
    });

    it('Should work if unknown editor', () => {
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
        edit: createColumnEditConfig({
          enabled: true,
          permission: {
            mode: PermissionMode.ALLOWED,
            userRole: [],
            field: { source: '', name: '' },
          },
          editor: {
            type: 'abc' as ColumnEditorType,
          },
        }),
      });

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          columns: [deviceColumn],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          eventBus,
        })
      );

      expect(result.current.columns[0].meta).toEqual(
        expect.objectContaining({
          editable: true,
          editor: {
            type: 'abc',
          },
        })
      );
    });

    it('Should check user role', () => {
      const columnForAdminEdit = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
        edit: createColumnEditConfig({
          enabled: true,
          permission: {
            mode: PermissionMode.USER_ROLE,
            userRole: [OrgRole.Admin],
            field: { source: '', name: '' },
          },
          editor: {
            type: ColumnEditorType.STRING,
          },
        }),
      });

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          columns: [columnForAdminEdit],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          eventBus,
        })
      );

      expect(result.current.columns[0].meta).toEqual(
        expect.objectContaining({
          editable: false,
        })
      );

      /**
       * Check actions column not added
       */
      expect(result.current.columns[1]).not.toBeDefined();
    });
  });

  it('Should enable pinning', () => {
    const deviceColumn = createColumnConfig({
      label: 'Device',
      field: {
        source: refId,
        name: 'device',
      },
      pin: ColumnPinDirection.LEFT,
    });
    const valueColumn = createColumnConfig({
      field: {
        source: refId,
        name: 'value',
      },
      pin: ColumnPinDirection.NONE,
    });

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn, valueColumn],
        objects: [],
        replaceVariables,
        actionsColumnConfig: actionsColumnConfigDefault,
        eventBus,
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        enablePinning: true,
      }),
      expect.objectContaining({
        id: valueColumn.field.name,
        enablePinning: false,
      }),
    ]);
  });

  describe('Nested Objects', () => {
    it('Should load nested data', async () => {
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
      });

      const nestedObject = createNestedObjectConfig({
        id: 'abc',
      });

      const commentsColumn = createColumnConfig({
        label: 'Comments',
        field: {
          source: refId,
          name: 'comments',
        },
        type: CellType.NESTED_OBJECTS,
        objectId: nestedObject.id,
      });

      /**
       * Mock Nested Data
       */
      const nestedData = new Map();
      nestedData.set(1, { id: 1, title: 'hello' });
      nestedData.set(2, { id: 2, title: 'hello2' });
      nestedData.set(3, { id: 3, title: 'hello3' });

      nestedObjectsMock.getValuesForColumn.mockReturnValue(nestedData);

      const { result } = await act(async () =>
        renderHook(() =>
          useTable({
            data: {
              series: [frame],
            } as any,
            columns: [deviceColumn, commentsColumn],
            objects: [nestedObject],
            replaceVariables,
            actionsColumnConfig: actionsColumnConfigDefault,
            eventBus,
          })
        )
      );

      expect(result.current.tableData).toEqual([
        {
          device: 'device1',
          comments: [
            { id: 1, title: 'hello' },
            { id: 2, title: 'hello2' },
          ],
        },
        {
          device: 'device2',
          comments: [{ id: 3, title: 'hello3' }],
        },
      ]);
    });

    it('Should work if no ids', async () => {
      const frame = toDataFrame({
        refId,
        fields: [
          {
            name: 'device',
            values: ['device1', 'device2'],
          },
          {
            name: 'comments',
            values: [[1], 2],
          },
        ],
      });
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
      });

      const nestedObject = createNestedObjectConfig({
        id: 'abc',
      });

      const commentsColumn = createColumnConfig({
        label: 'Comments',
        field: {
          source: refId,
          name: 'comments',
        },
        type: CellType.NESTED_OBJECTS,
        objectId: nestedObject.id,
      });

      /**
       * Mock Nested Data
       */
      const nestedData = new Map();
      nestedData.set(1, { id: 1, title: 'hello' });
      nestedData.set(2, { id: 2, title: 'hello2' });

      nestedObjectsMock.getValuesForColumn.mockReturnValue(nestedData);

      const { result } = await act(async () =>
        renderHook(() =>
          useTable({
            data: {
              series: [frame],
            } as any,
            columns: [deviceColumn, commentsColumn],
            objects: [nestedObject],
            replaceVariables,
            actionsColumnConfig: actionsColumnConfigDefault,
            eventBus,
          })
        )
      );

      expect(result.current.tableData).toEqual([
        {
          device: 'device1',
          comments: [{ id: 1, title: 'hello' }],
        },
        {
          device: 'device2',
          comments: 2,
        },
      ]);
    });

    it('Should build options for column with nested objects', async () => {
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
      });

      const commentsObject = createNestedObjectConfig({
        id: 'comments',
        type: NestedObjectType.CARDS,
        add: createNestedObjectOperationConfig({
          enabled: true,
          permission: createPermissionConfig({
            mode: PermissionMode.ALLOWED,
          }),
          request: createTableRequestConfig({
            datasource: 'addDatasource',
          }),
        }),
        update: createNestedObjectOperationConfig({
          enabled: true,
          permission: createPermissionConfig({
            mode: PermissionMode.ALLOWED,
          }),
          request: createTableRequestConfig({
            datasource: 'updateDatasource',
          }),
        }),
        delete: createNestedObjectOperationConfig({
          enabled: true,
          permission: createPermissionConfig({
            mode: PermissionMode.ALLOWED,
          }),
          request: createTableRequestConfig({
            datasource: 'deleteDatasource',
          }),
        }),
      });

      const readonlyObject = createNestedObjectConfig({
        id: 'readonlyComments',
        type: NestedObjectType.CARDS,
        add: createNestedObjectOperationConfig({
          enabled: false,
        }),
        update: createNestedObjectOperationConfig({
          enabled: false,
        }),
        delete: createNestedObjectOperationConfig({
          enabled: false,
        }),
      });

      const commentsColumn = createColumnConfig({
        label: 'Comments',
        field: {
          source: refId,
          name: 'comments',
        },
        type: CellType.NESTED_OBJECTS,
        objectId: commentsObject.id,
      });

      const readonlyCommentsColumn = createColumnConfig({
        label: 'Readonly Comments',
        field: {
          source: refId,
          name: 'comments',
        },
        type: CellType.NESTED_OBJECTS,
        objectId: readonlyObject.id,
      });

      const { result } = await act(async () =>
        renderHook(() =>
          useTable({
            data: {
              series: [frame],
            } as any,
            columns: [deviceColumn, commentsColumn, readonlyCommentsColumn],
            objects: [commentsObject, readonlyObject],
            replaceVariables,
            actionsColumnConfig: actionsColumnConfigDefault,
            eventBus,
          })
        )
      );

      expect(result.current.columns[1]).toEqual(
        expect.objectContaining({
          id: 'comments',
          meta: expect.objectContaining({
            nestedObjectOptions: expect.objectContaining({
              operations: {
                add: {
                  enabled: true,
                  request: commentsObject.add?.request,
                },
                update: {
                  enabled: true,
                  request: commentsObject.update?.request,
                },
                delete: {
                  enabled: true,
                  request: commentsObject.delete?.request,
                },
              },
            }),
          }),
        })
      );

      expect(result.current.columns[2]).toEqual(
        expect.objectContaining({
          id: 'comments',
          meta: expect.objectContaining({
            nestedObjectOptions: expect.objectContaining({
              operations: {
                add: expect.objectContaining({
                  enabled: false,
                }),
                update: expect.objectContaining({
                  enabled: false,
                }),
                delete: expect.objectContaining({
                  enabled: false,
                }),
              },
            }),
          }),
        })
      );
    });

    it('Should build options if unknown object type', async () => {
      const commentsObject = createNestedObjectConfig({
        id: 'comments',
        type: 'unknown' as never,
      });

      const commentsColumn = createColumnConfig({
        label: 'Comments',
        field: {
          source: refId,
          name: 'comments',
        },
        type: CellType.NESTED_OBJECTS,
        objectId: commentsObject.id,
      });

      const { result } = await act(async () =>
        renderHook(() =>
          useTable({
            data: {
              series: [frame],
            } as any,
            columns: [commentsColumn],
            objects: [commentsObject],
            replaceVariables,
            actionsColumnConfig: actionsColumnConfigDefault,
            eventBus,
          })
        )
      );

      expect(result.current.columns[0]).toEqual(
        expect.objectContaining({
          id: 'comments',
          meta: expect.objectContaining({
            nestedObjectOptions: undefined,
          }),
        })
      );
    });
  });

  describe('Grouping, collapse/expand', () => {
    it('Should disable grouping for last column if group option is enable', () => {
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
        group: true,
        aggregation: CellAggregation.UNIQUE_COUNT,
      });
      const valueColumn = createColumnConfig({
        field: {
          source: refId,
          name: 'value',
        },
        group: true,
        aggregation: CellAggregation.NONE,
      });
      const disabledColumn = createColumnConfig({
        enabled: true,
        group: true,
        field: {
          source: refId,
          name: 'other',
        },
      });

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          columns: [deviceColumn, valueColumn, disabledColumn],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          eventBus,
        })
      );

      expect(result.current.columns).toEqual([
        expect.objectContaining({
          enableGrouping: true,
        }),
        expect.objectContaining({
          enableGrouping: true,
        }),
        expect.objectContaining({
          enableGrouping: false,
        }),
      ]);
    });

    it('Should enable grouping for last column if group option is enable and nested columns are exist', () => {
      const deviceColumn = createColumnConfig({
        label: 'Device',
        field: {
          source: refId,
          name: 'device',
        },
        group: true,
        aggregation: CellAggregation.UNIQUE_COUNT,
      });
      const valueColumn = createColumnConfig({
        field: {
          source: refId,
          name: 'value',
        },
        group: true,
        aggregation: CellAggregation.NONE,
      });
      const disabledColumn = createColumnConfig({
        enabled: true,
        group: true,
        field: {
          source: refId,
          name: 'other',
        },
      });
      const nestedColumn = createColumnConfig({
        type: CellType.NESTED_OBJECTS,
        enabled: true,
        field: {
          source: refId,
          name: 'other',
        },
      });

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          columns: [deviceColumn, valueColumn, disabledColumn, nestedColumn],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          eventBus,
        })
      );

      expect(result.current.columns).toEqual([
        expect.objectContaining({
          enableGrouping: true,
        }),
        expect.objectContaining({
          enableGrouping: true,
        }),
        expect.objectContaining({
          enableGrouping: true,
        }),
        expect.objectContaining({
          enableGrouping: false,
        }),
      ]);
    });
  });

  describe('Row Highlight', () => {
    it('Should add row highlight state for single variable', () => {
      /**
       * Mock variables
       */
      jest.mocked(runtimeVariablesMock.getVariable).mockReturnValue(
        createVariable({
          name: 'device',
          type: 'custom',
          current: {
            value: 'device2',
          },
        })
      );

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          columns: [
            createColumnConfig({
              field: {
                source: refId,
                name: 'device',
              },
            }),
            createColumnConfig({
              field: {
                source: refId,
                name: 'value',
              },
            }),
          ],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          rowHighlightConfig: createRowHighlightConfig({
            enabled: true,
            columnId: `${refId}:device`,
            variable: 'device',
          }),
          eventBus,
        })
      );

      expect(result.current.tableData).toEqual([
        {
          device: frame.fields[0].values[0],
          value: frame.fields[1].values[0],
          [ROW_HIGHLIGHT_STATE_KEY]: false,
        },
        {
          device: frame.fields[0].values[1],
          value: frame.fields[1].values[1],
          [ROW_HIGHLIGHT_STATE_KEY]: true,
        },
      ]);
    });

    it('Should add row highlight state for multi variable', () => {
      /**
       * Mock variables
       */
      jest.mocked(runtimeVariablesMock.getVariable).mockReturnValue(
        createVariable({
          name: 'device',
          type: 'custom',
          current: {
            value: ['device1', 'device2'],
          },
        })
      );

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          columns: [
            createColumnConfig({
              field: {
                source: refId,
                name: 'device',
              },
            }),
            createColumnConfig({
              field: {
                source: refId,
                name: 'value',
              },
            }),
          ],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          rowHighlightConfig: createRowHighlightConfig({
            enabled: true,
            columnId: `${refId}:device`,
            variable: 'device',
          }),
          eventBus,
        })
      );

      expect(result.current.tableData).toEqual([
        {
          device: frame.fields[0].values[0],
          value: frame.fields[1].values[0],
          [ROW_HIGHLIGHT_STATE_KEY]: true,
        },
        {
          device: frame.fields[0].values[1],
          value: frame.fields[1].values[1],
          [ROW_HIGHLIGHT_STATE_KEY]: true,
        },
      ]);
    });

    it('Should add row highlight state fallback if unable to get value', () => {
      /**
       * Mock variables
       */
      jest.mocked(runtimeVariablesMock.getVariable).mockReturnValue(null);

      const { result } = renderHook(() =>
        useTable({
          data: {
            series: [frame],
          } as any,
          columns: [
            createColumnConfig({
              field: {
                source: refId,
                name: 'device',
              },
            }),
            createColumnConfig({
              field: {
                source: refId,
                name: 'value',
              },
            }),
          ],
          objects: [],
          replaceVariables,
          actionsColumnConfig: actionsColumnConfigDefault,
          rowHighlightConfig: createRowHighlightConfig({
            enabled: true,
            columnId: `${refId}:device`,
            /**
             * Unknown variable
             */
            variable: 'device123',
          }),
          eventBus,
        })
      );

      expect(result.current.tableData).toEqual([
        {
          device: frame.fields[0].values[0],
          value: frame.fields[1].values[0],
          [ROW_HIGHLIGHT_STATE_KEY]: false,
        },
        {
          device: frame.fields[0].values[1],
          value: frame.fields[1].values[1],
          [ROW_HIGHLIGHT_STATE_KEY]: false,
        },
      ]);
    });
  });
});
