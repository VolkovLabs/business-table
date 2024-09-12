import { cleanPayloadObject, formatNumberValue } from './editor';

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
});
