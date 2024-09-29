import { NestedObjectType } from '@/types';
import { createNestedObjectEditorConfig, NestedObjectCardMapper } from '@/utils';

import { nestedObjectEditorsRegistry } from './NestedObjectEditorsRegistry';

describe('nestedObjectEditorsRegistry', () => {
  it('Should return editor', () => {
    expect(nestedObjectEditorsRegistry.get(NestedObjectType.CARDS)?.editor).toBeDefined();
    expect(nestedObjectEditorsRegistry.get('unknown' as never)?.editor).not.toBeDefined();
  });

  it('Should return control', () => {
    expect(nestedObjectEditorsRegistry.get(NestedObjectType.CARDS)?.control).toBeDefined();
    expect(nestedObjectEditorsRegistry.get('unknown' as never)?.control).not.toBeDefined();
  });

  it('Should build cards control options', () => {
    const getControlOptions = nestedObjectEditorsRegistry.get(NestedObjectType.CARDS)?.getControlOptions;

    expect(
      getControlOptions?.({
        isLoading: true,
        config: createNestedObjectEditorConfig({
          type: NestedObjectType.CARDS,
        }),
        data: {} as never,
        header: 'comments',
        operations: {
          add: {
            enabled: false,
          },
          update: {
            enabled: true,
          },
          delete: {
            enabled: false,
          },
        },
      })
    ).toEqual(
      expect.objectContaining({
        type: NestedObjectType.CARDS,
        mapper: expect.any(NestedObjectCardMapper),
        operations: {
          add: {
            enabled: false,
          },
          update: {
            enabled: true,
          },
          delete: {
            enabled: false,
          },
        },
      })
    );
  });
});
