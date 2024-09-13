import { locationService } from '@grafana/runtime';

import {
  getRuntimeVariable,
  getVariableKeyForLocation,
  getVariableNumberValue,
  getVariablesMap,
  setVariablesValue,
} from './variable';

describe('Variable utils', () => {
  describe('setVariablesValue', () => {
    it('Should update if payload contains values', () => {
      setVariablesValue({
        'var-pageIndex': 1,
        'var-pageSize': 100,
      });

      expect(locationService.partial).toHaveBeenCalledWith(
        {
          'var-pageIndex': 1,
          'var-pageSize': 100,
        },
        true
      );
    });

    it('Should not update if empty payload', () => {
      setVariablesValue({});

      expect(locationService.partial).not.toHaveBeenCalled();
    });
  });

  describe('getVariableKeyForLocation', () => {
    it('Should build var name for location', () => {
      expect(getVariableKeyForLocation('pageIndex')).toEqual('var-pageIndex');
      expect(getVariableKeyForLocation('var-pageIndex')).toEqual('var-var-pageIndex');
    });
  });

  describe('getVariableNumberValue', () => {
    it('Should return var value if number', () => {
      expect(
        getVariableNumberValue({
          current: {
            value: '123',
          },
        } as any)
      ).toEqual(123);
      expect(
        getVariableNumberValue({
          current: {
            value: ['111'],
          },
        } as any)
      ).toEqual(111);
      expect(
        getVariableNumberValue({
          current: {
            value: {},
          },
        } as any)
      ).toEqual(0);
    });

    it('Should return nothing if no var number', () => {
      expect(getVariableNumberValue({} as any)).toEqual(undefined);
      expect(
        getVariableNumberValue({
          current: {
            value: 'abc',
          },
        } as any)
      ).toEqual(undefined);
    });
  });

  describe('getVariablesMap', () => {
    it('Should convert array to map', () => {
      const varPageIndex = { name: 'pageIndex' };
      const varPageSize = { name: 'pageSize' };

      expect(getVariablesMap([varPageIndex, varPageSize, null] as any)).toEqual({
        [varPageIndex.name]: varPageIndex,
        [varPageSize.name]: varPageSize,
      });
    });
  });

  describe('getRuntimeVariable', () => {
    it('Should convert var to runtime', () => {
      const varPageIndex = { name: 'pageIndex' };

      expect(getRuntimeVariable(varPageIndex as any)).toEqual(varPageIndex);
    });
  });
});
