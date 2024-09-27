import { FieldType, OrgRole, ReducerID, toDataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { act, renderHook } from '@testing-library/react';

import { ACTIONS_COLUMN_ID } from '@/constants';
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
  createColumnAppearanceConfig,
  createColumnConfig,
  createColumnEditConfig,
  createNestedObjectConfig,
  createNestedObjectOperationConfig,
  createPermissionConfig,
  createTableRequestConfig,
  createVariable,
  FooterContext,
} from '@/utils';

import { useNestedObjects } from './useNestedObjects';
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

describe('useTable', () => {
  /**
   * Replace Variables
   */
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

  beforeEach(() => {
    jest.mocked(useNestedObjects).mockReturnValue(nestedObjectsMock);
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
        ],
        objects: [],
        replaceVariables,
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

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn, valueColumn],
        objects: [],
        replaceVariables,
      })
    );

    expect(result.current.columns).toEqual([
      expect.objectContaining({
        id: deviceColumn.field.name,
        accessorKey: deviceColumn.field.name,
        header: deviceColumn.label,
        cell: expect.any(Function),
        enableGrouping: deviceColumn.group,
        aggregationFn: deviceColumn.aggregation,
      }),
      expect.objectContaining({
        id: valueColumn.field.name,
        accessorKey: valueColumn.field.name,
        header: frame.fields[1].name,
        cell: expect.any(Function),
        enableGrouping: valueColumn.group,
        aggregationFn: expect.any(Function),
      }),
    ]);

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
    jest.mocked(getTemplateSrv().getVariables).mockReturnValue([
      createVariable({
        name: deviceColumn.filter.variable,
        type: 'query',
        multi: true,
      } as never),
    ]);

    const { result } = renderHook(() =>
      useTable({
        data: {
          series: [frame],
        } as any,
        columns: [deviceColumn],
        objects: [],
        replaceVariables,
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
    it('Should enable editor', () => {
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
});
