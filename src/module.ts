import { identityOverrideProcessor, PanelPlugin } from '@grafana/data';

import { CellOptionsEditor, TablePanel } from './components';
import { CellType, PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(TablePanel)
  .useFieldConfig({
    useCustomConfig: (builder) => {
      builder.addCustomEditor({
        id: 'cellOptions',
        path: 'cellOptions',
        name: 'Cell Options',
        category: ['Cell Options'],
        defaultValue: {
          type: CellType.AUTO,
        },
        editor: CellOptionsEditor,
        override: CellOptionsEditor,
        process: identityOverrideProcessor,
        shouldApply: () => true,
      });
    },
  })
  .setPanelOptions((builder) => {
    return builder;
  });
