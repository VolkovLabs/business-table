import { getMigratedOptions } from '@/migration';
import { ColumnFilterMode, ColumnPinDirection } from '@/types';
import { createColumnConfig, createNestedObjectConfig, createPanelOptions, createTableConfig } from '@/utils';

describe('migration', () => {
  it('Should return panel options', () => {
    const options = {
      someField: 'abc',
    };

    expect(
      getMigratedOptions({
        options: options as any,
      } as any)
    ).toEqual(expect.objectContaining(options));
  });

  describe('1.1.0', () => {
    it('Should normalize filter parameters for groups', () => {
      const normalizedOptions = getMigratedOptions({
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

    it('Should normalize tabsSorting', () => {
      expect(getMigratedOptions({ options: {} } as any)).toEqual(
        expect.objectContaining({
          tabsSorting: false,
        })
      );
      expect(getMigratedOptions({ options: { tabsSorting: false } } as any)).toEqual(
        expect.objectContaining({
          tabsSorting: false,
        })
      );
      expect(getMigratedOptions({ options: { tabsSorting: true } } as any)).toEqual(
        expect.objectContaining({
          tabsSorting: true,
        })
      );
    });
  });

  describe('1.3.0', () => {
    it('Should normalize column pin', () => {
      expect(
        getMigratedOptions({
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

    it('Should normalize descFirst option for sort', () => {
      expect(
        getMigratedOptions({
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
    it('Should normalize nested objects', () => {
      expect(getMigratedOptions({ options: {} } as any)).toEqual(
        expect.objectContaining({
          nestedObjects: [],
        })
      );

      const nestedObject = createNestedObjectConfig({ name: '123' });
      expect(getMigratedOptions({ options: createPanelOptions({ nestedObjects: [nestedObject] }) } as any)).toEqual(
        expect.objectContaining({
          nestedObjects: [nestedObject],
        })
      );
    });
  });
});
