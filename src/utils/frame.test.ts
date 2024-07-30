import { FieldType, toDataFrame } from '@grafana/data';

import { getFieldBySource } from './frame';

describe('Frame utils', () => {
  describe('getFieldBySource', () => {
    it('Should find field with refId', () => {
      expect(
        getFieldBySource(
          [
            toDataFrame({
              refId: 'A',
              fields: [
                {
                  name: 'value',
                  type: FieldType.string,
                  values: [1],
                },
              ],
            }),
            toDataFrame({
              refId: 'B',
              fields: [
                {
                  name: 'value',
                  type: FieldType.string,
                  values: [2],
                },
              ],
            }),
          ],
          {
            refId: 'B',
            name: 'value',
          }
        )
      ).toEqual(
        expect.objectContaining({
          name: 'value',
          values: [2],
        })
      );
    });

    it('Should find field without refId', () => {
      expect(
        getFieldBySource(
          [
            toDataFrame({
              fields: [
                {
                  name: 'value',
                  type: FieldType.string,
                  values: [1],
                },
              ],
            }),
            toDataFrame({
              fields: [
                {
                  name: 'value',
                  type: FieldType.string,
                  values: [2],
                },
              ],
            }),
          ],
          {
            name: 'value',
          }
        )
      ).toEqual(
        expect.objectContaining({
          name: 'value',
          values: [1],
        })
      );
    });
  });
});
