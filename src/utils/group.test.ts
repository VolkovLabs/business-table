import { FieldType, toDataFrame } from '@grafana/data';

import { findField } from './group';

describe('Frame utils', () => {
  describe('findField', () => {
    it('Should find first suitable field', () => {
      const frame1 = toDataFrame({
        fields: [
          {
            name: 'field',
            type: FieldType.number,
          },
        ],
      });
      const frame2 = toDataFrame({
        fields: [
          {
            name: 'field',
            type: FieldType.string,
          },
        ],
      });

      const result = findField([frame1, frame2], (field) => field.name === 'field');

      expect(result).toBeDefined();
      expect(result?.name).toEqual('field');
      expect(result?.type).toEqual(FieldType.number);
    });

    it('Should return nothing if no field found', () => {
      const frame1 = toDataFrame({
        fields: [
          {
            name: 'field',
            type: FieldType.number,
          },
        ],
      });

      const result = findField([frame1], (field) => field.name === '123');

      expect(result).not.toBeDefined();
    });
  });
});
