import { getMigratedOptions } from '@/migration';
import { ColumnFilterMode } from '@/types';
import { createPanelOptions } from '@/utils';

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
});
