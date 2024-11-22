import { getBackendSrv } from '@grafana/runtime';

import { getMigratedOptions } from '@/migration';
import { CellType, ColumnEditorType, ColumnFilterMode, ColumnPinDirection, ImageScale, PermissionMode } from '@/types';
import {
  createColumnConfig,
  createColumnEditConfig,
  createNestedObjectConfig,
  createPanelOptions,
  createTableConfig,
  createTableRequestConfig,
} from '@/utils';

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  getBackendSrv: jest.fn(),
}));

describe('migration', () => {
  beforeEach(() => {
    jest.mocked(getBackendSrv).mockImplementation(
      () =>
        ({
          get: jest.fn(() => [
            {
              name: 'Datasource 1',
              uid: 'ds1',
            },
            {
              name: 'Datasource 2',
              uid: 'ds2',
            },
            {
              name: 'Datasource 3',
              uid: 'ds3',
            },
            {
              name: 'Datasource 4',
              uid: 'ds4',
            },
            {
              name: 'Datasource 5',
              uid: 'ds5',
            },
          ]),
        }) as any
    );
  });
  it('Should return panel options', async () => {
    const options = {
      someField: 'abc',
    };

    expect(
      await getMigratedOptions({
        options: options as any,
      } as any)
    ).toEqual(expect.objectContaining(options));
  });

  describe('1.1.0', () => {
    it('Should normalize filter parameters for groups', async () => {
      const normalizedOptions = await getMigratedOptions({
        options: createPanelOptions({
          groups: [
            {
              name: 'Column Groups',
              items: [
                {
                  field: {
                    source: '',
                    name: 'a',
                  },
                  filter: undefined,
                } as any,
                {
                  field: {
                    source: '',
                    name: 'b',
                  },
                  filter: {
                    enabled: true,
                    mode: ColumnFilterMode.QUERY,
                    variable: 'abc',
                  },
                } as any,
              ],
            },
          ],
        } as any),
      } as any);

      /**
       * Should add filter
       */
      expect(normalizedOptions.tables[0].items[0].filter).toEqual({
        enabled: false,
        mode: ColumnFilterMode.CLIENT,
        variable: '',
      });

      /**
       * Should keep current filter
       */
      expect(normalizedOptions.tables[0].items[1].filter).toEqual({
        enabled: true,
        mode: ColumnFilterMode.QUERY,
        variable: 'abc',
      });
    });

    it('Should normalize tabsSorting', async () => {
      expect(await getMigratedOptions({ options: {} } as any)).toEqual(
        expect.objectContaining({
          tabsSorting: false,
        })
      );
      expect(await getMigratedOptions({ options: { tabsSorting: false } } as any)).toEqual(
        expect.objectContaining({
          tabsSorting: false,
        })
      );
      expect(await getMigratedOptions({ options: { tabsSorting: true } } as any)).toEqual(
        expect.objectContaining({
          tabsSorting: true,
        })
      );
    });
  });

  describe('1.3.0', () => {
    it('Should normalize column pin', async () => {
      expect(
        await getMigratedOptions({
          options: {
            tables: [
              createTableConfig({
                items: [
                  createColumnConfig({
                    pin: true as never,
                  }),
                  createColumnConfig({
                    pin: false as never,
                  }),
                ],
              }),
            ],
          },
        } as any)
      ).toEqual(
        expect.objectContaining({
          tables: [
            expect.objectContaining({
              items: [
                expect.objectContaining({ pin: ColumnPinDirection.LEFT }),
                expect.objectContaining({ pin: ColumnPinDirection.NONE }),
              ],
            }),
          ],
        })
      );
    });

    it('Should normalize descFirst option for sort', async () => {
      expect(
        await getMigratedOptions({
          options: {
            tables: [
              createTableConfig({
                items: [
                  createColumnConfig({
                    sort: {
                      enabled: false,
                    } as any,
                  }),
                  createColumnConfig({
                    sort: {
                      enabled: true,
                    } as any,
                  }),
                  createColumnConfig({
                    sort: {
                      enabled: true,
                      descFirst: true,
                    } as any,
                  }),
                ],
              }),
            ],
          },
        } as any)
      ).toEqual(
        expect.objectContaining({
          tables: [
            expect.objectContaining({
              items: [
                expect.objectContaining({ sort: { enabled: false, descFirst: false } }),
                expect.objectContaining({ sort: { enabled: true, descFirst: false } }),
                expect.objectContaining({ sort: { enabled: true, descFirst: true } }),
              ],
            }),
          ],
        })
      );
    });
  });

  describe('1.4.0', () => {
    it('Should normalize nested objects', async () => {
      expect(await getMigratedOptions({ options: {} } as any)).toEqual(
        expect.objectContaining({
          nestedObjects: [],
        })
      );

      const nestedObject = createNestedObjectConfig({ name: '123' });
      expect(
        await getMigratedOptions({ options: createPanelOptions({ nestedObjects: [nestedObject] }) } as any)
      ).toEqual(
        expect.objectContaining({
          nestedObjects: [nestedObject],
        })
      );
    });
  });

  /**
   * Normalize Datasource Option
   */
  describe('1.7.0', () => {
    it('Should normalize showHeader', async () => {
      expect(
        await getMigratedOptions({
          options: {
            tables: [
              {
                name: '',
                items: [],
              },
            ],
          },
        } as any)
      ).toEqual(
        expect.objectContaining({
          tables: [
            expect.objectContaining({
              showHeader: true,
              items: [],
            }),
          ],
        })
      );
    });

    it('Should normalize datasource option from name to id ', async () => {
      expect(
        await getMigratedOptions({
          pluginVersion: '1.5.0',
          options: {
            tables: [
              createTableConfig({
                items: [
                  createColumnConfig({
                    sort: {
                      enabled: false,
                    } as any,
                  }),
                ],
                update: createTableRequestConfig({
                  datasource: 'Datasource 1',
                }),
              }),
            ],
          },
        } as any)
      ).toEqual(
        expect.objectContaining({
          tables: [
            expect.objectContaining({
              update: {
                datasource: 'ds1',
                payload: {},
              },
            }),
          ],
        })
      );
    });

    it('Should normalize datasource option from name to id and return empty string if unknown DS', async () => {
      expect(
        await getMigratedOptions({
          pluginVersion: '1.5.0',
          options: {
            tables: [
              createTableConfig({
                items: [
                  createColumnConfig({
                    sort: {
                      enabled: false,
                    } as any,
                  }),
                ],
                update: createTableRequestConfig({
                  datasource: 'Datasource 13',
                }),
              }),
            ],
          },
        } as any)
      ).toEqual(
        expect.objectContaining({
          tables: [
            expect.objectContaining({
              update: {
                datasource: '',
                payload: {},
              },
            }),
          ],
        })
      );
    });

    it('Should normalize datasource options for nested operations', async () => {
      const nestedObject = createNestedObjectConfig({
        name: 'nested1',
        add: {
          enabled: true,
          permission: { mode: PermissionMode.ALLOWED, userRole: [] },
          request: createTableRequestConfig({
            datasource: 'Datasource 1',
          }),
        },
        get: createTableRequestConfig({
          datasource: 'Datasource 5',
        }),
        delete: {
          enabled: true,
          permission: { mode: PermissionMode.ALLOWED, userRole: [] },
          request: createTableRequestConfig({
            datasource: 'Datasource 3',
          }),
        },
      });

      const nestedObjectSecond = createNestedObjectConfig({
        name: 'nested2',
        add: {
          enabled: true,
          permission: { mode: PermissionMode.ALLOWED, userRole: [] },
          request: createTableRequestConfig({
            datasource: 'Datasource 2',
          }),
        },
        get: createTableRequestConfig({
          datasource: 'Datasource 3',
        }),
        delete: {
          enabled: true,
          permission: { mode: PermissionMode.ALLOWED, userRole: [] },
          request: createTableRequestConfig({
            datasource: '',
          }),
        },
      });

      const result = await getMigratedOptions({
        pluginVersion: '1.5.0',
        options: {
          nestedObjects: [nestedObject, nestedObjectSecond],
          tables: [
            createTableConfig({
              items: [
                createColumnConfig({
                  sort: {
                    enabled: false,
                  } as any,
                }),
              ],
              update: createTableRequestConfig({
                datasource: 'Datasource 1',
              }),
            }),
          ],
        },
      } as any);

      const nestedResultFirst = result.nestedObjects[0];
      const nestedResultSecond = result.nestedObjects[1];

      expect(nestedResultFirst).toEqual({
        id: '',
        name: 'nested1',
        type: 'cards',
        add: expect.objectContaining({
          request: expect.objectContaining({
            datasource: 'ds1',
            payload: {},
          }),
        }),
        delete: expect.objectContaining({
          request: expect.objectContaining({
            datasource: 'ds3',
            payload: {},
          }),
        }),
        get: expect.objectContaining({
          datasource: 'ds5',
        }),
        editor: expect.any(Object),
      });

      expect(nestedResultSecond).toEqual({
        id: '',
        name: 'nested2',
        type: 'cards',
        add: expect.objectContaining({
          request: expect.objectContaining({
            datasource: 'ds2',
            payload: {},
          }),
        }),
        delete: expect.objectContaining({
          request: expect.objectContaining({
            datasource: '',
            payload: {},
          }),
        }),
        get: expect.objectContaining({
          datasource: 'ds3',
        }),
        editor: expect.any(Object),
      });
    });
  });

  describe('1.8.0', () => {
    it('Should normalize select editor option', async () => {
      const normalizedOptions = await getMigratedOptions({
        pluginVersion: '1.5.0',
        options: createPanelOptions({
          tables: [
            createTableConfig({
              items: [
                createColumnConfig({
                  pin: true as never,
                  edit: createColumnEditConfig({
                    enabled: true,
                    editor: {
                      type: ColumnEditorType.STRING,
                    },
                  }),
                }),
                createColumnConfig({
                  pin: true as never,
                }),
                createColumnConfig({
                  pin: false as never,
                  edit: createColumnEditConfig({
                    enabled: true,
                    editor: {
                      type: ColumnEditorType.SELECT,
                    },
                  }),
                }),
                createColumnConfig({
                  pin: false as never,
                  edit: createColumnEditConfig({
                    enabled: true,
                    editor: {
                      customValues: true,
                      type: ColumnEditorType.SELECT,
                    },
                  }),
                }),
              ],
            }),
          ],
        }),
      } as any);

      expect(normalizedOptions.tables[0].items[0].edit.editor).toEqual({
        type: ColumnEditorType.STRING,
      });
      expect(normalizedOptions.tables[0].items[1].edit.editor).toEqual({
        type: ColumnEditorType.STRING,
      });
      expect(normalizedOptions.tables[0].items[2].edit.editor).toEqual({
        type: ColumnEditorType.SELECT,
        customValues: false,
      });
      expect(normalizedOptions.tables[0].items[3].edit.editor).toEqual({
        type: ColumnEditorType.SELECT,
        customValues: true,
      });
    });

    it('Should normalize expanded', async () => {
      expect(
        await getMigratedOptions({
          options: {
            tables: [
              {
                name: '',
                items: [],
              },
            ],
          },
        } as any)
      ).toEqual(
        expect.objectContaining({
          tables: [
            expect.objectContaining({
              expanded: false,
              items: [],
            }),
          ],
        })
      );
    });
  });

  describe('1.9.0', () => {
    it('Should normalize select editor option', async () => {
      const normalizedOptions = await getMigratedOptions({
        pluginVersion: '1.8.0',
        options: createPanelOptions({
          tables: [
            createTableConfig({
              items: [
                {
                  type: CellType.AUTO,
                  filter: undefined,
                } as any,
                createColumnConfig({
                  pin: true as never,
                  scale: ImageScale.AUTO,
                }),
                createColumnConfig({
                  pin: false as never,
                  scale: ImageScale.CRISP_EDGES,
                }),
                createColumnConfig({
                  pin: false as never,
                  scale: ImageScale.PIXELATED,
                }),
              ],
            }),
          ],
        }),
      } as any);

      expect(normalizedOptions.tables[0].items[0]).toEqual(
        expect.objectContaining({
          scale: ImageScale.AUTO,
        })
      );
      expect(normalizedOptions.tables[0].items[1]).toEqual(
        expect.objectContaining({
          scale: ImageScale.AUTO,
        })
      );
      expect(normalizedOptions.tables[0].items[2]).toEqual(
        expect.objectContaining({
          scale: ImageScale.CRISP_EDGES,
        })
      );
      expect(normalizedOptions.tables[0].items[3]).toEqual(
        expect.objectContaining({
          scale: ImageScale.PIXELATED,
        })
      );
    });
  });
});
