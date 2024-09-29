import { NestedObjectType } from '@/types';
import {
  createNestedObjectEditorRegistryItem,
  createNestedObjectEditorsRegistry,
  NestedObjectCardMapper,
} from '@/utils';

import { NestedObjectCardsControl, NestedObjectCardsEditor } from './components';

/**
 * Nested Object Editors Registry
 */
export const nestedObjectEditorsRegistry = createNestedObjectEditorsRegistry([
  createNestedObjectEditorRegistryItem({
    id: NestedObjectType.CARDS,
    editor: NestedObjectCardsEditor,
    control: NestedObjectCardsControl,
    getControlOptions: (params) => ({
      ...params,
      type: params.config.type,
      isLoading: params.isLoading,
      mapper: new NestedObjectCardMapper(params.config),
    }),
  }),
]);
