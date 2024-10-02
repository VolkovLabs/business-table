import { ColumnFilterMode, PaginationMode } from '@/types';
import {
  createColumnConfig,
  createColumnFilterConfig,
  createTableConfig,
  createTablePaginationConfig,
} from '@/utils/test';

import {
  cleanPayloadObject,
  formatNumberValue,
  hasTablePaginationError,
  hasTablePaginationQueryDisabled,
} from './editor';

describe('Editor utils', () => {
  describe('cleanPayloadObject', () => {
    it('Should clean undefined properties', () => {
      expect(
        cleanPayloadObject({
          name: 'abc',
          value: 0,
          value2: null,
          value3: undefined,
        })
      ).toEqual({
        name: 'abc',
        value: 0,
        value2: null,
      });
    });
  });

  describe('formatNumberValue', () => {
    it('Should show value if number', () => {
      expect(formatNumberValue('abc')).toEqual('');
      expect(formatNumberValue(123)).toEqual(123);
    });
  });

  describe('hasTablePaginationQueryDisabled', () => {
    it('Should be truthy if visible column with enabled client filter', () => {
      expect(
        hasTablePaginationQueryDisabled(
          createTableConfig({
            items: [
              createColumnConfig({
                enabled: true,
                filter: createColumnFilterConfig({
                  enabled: true,
                  mode: ColumnFilterMode.CLIENT,
                }),
              }),
            ],
          })
        )
      ).toBeTruthy();
    });

    it('Should be falsy if hidden column with enabled client filter', () => {
      expect(
        hasTablePaginationQueryDisabled(
          createTableConfig({
            items: [
              createColumnConfig({
                enabled: false,
                filter: createColumnFilterConfig({
                  enabled: true,
                  mode: ColumnFilterMode.CLIENT,
                }),
              }),
            ],
          })
        )
      ).toBeFalsy();
    });

    it('Should be falsy if visible column with disabled client filter', () => {
      expect(
        hasTablePaginationQueryDisabled(
          createTableConfig({
            items: [
              createColumnConfig({
                enabled: true,
                filter: createColumnFilterConfig({
                  enabled: false,
                  mode: ColumnFilterMode.CLIENT,
                }),
              }),
            ],
          })
        )
      ).toBeFalsy();
    });

    it('Should be falsy if visible column with enabled query filter', () => {
      expect(
        hasTablePaginationQueryDisabled(
          createTableConfig({
            items: [
              createColumnConfig({
                enabled: true,
                filter: createColumnFilterConfig({
                  enabled: true,
                  mode: ColumnFilterMode.QUERY,
                }),
              }),
            ],
          })
        )
      ).toBeFalsy();
    });
  });

  describe('hasTablePaginationError', () => {
    it('Should be truthy if query pagination enabled and visible column with enabled client filter', () => {
      expect(
        hasTablePaginationError(
          createTableConfig({
            items: [
              createColumnConfig({
                enabled: true,
                filter: createColumnFilterConfig({
                  enabled: true,
                  mode: ColumnFilterMode.CLIENT,
                }),
              }),
            ],
            pagination: createTablePaginationConfig({
              enabled: true,
              mode: PaginationMode.QUERY,
            }),
          })
        )
      ).toBeTruthy();
    });

    it('Should be falsy if query pagination disabled and visible column with enabled client filter', () => {
      expect(
        hasTablePaginationError(
          createTableConfig({
            items: [
              createColumnConfig({
                enabled: true,
                filter: createColumnFilterConfig({
                  enabled: true,
                  mode: ColumnFilterMode.CLIENT,
                }),
              }),
            ],
            pagination: createTablePaginationConfig({
              enabled: false,
              mode: PaginationMode.QUERY,
            }),
          })
        )
      ).toBeFalsy();
    });

    it('Should be falsy if client pagination enabled and visible column with enabled client filter', () => {
      expect(
        hasTablePaginationError(
          createTableConfig({
            items: [
              createColumnConfig({
                enabled: true,
                filter: createColumnFilterConfig({
                  enabled: true,
                  mode: ColumnFilterMode.CLIENT,
                }),
              }),
            ],
            pagination: createTablePaginationConfig({
              enabled: true,
              mode: PaginationMode.CLIENT,
            }),
          })
        )
      ).toBeFalsy();
    });
  });
});
