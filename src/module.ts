import { identityOverrideProcessor, PanelPlugin } from '@grafana/data';

import { CellOptionsEditor, ColumnsEditor, TablePanel } from './components';
import { CellType, ColumnMode, PanelOptions } from './types';

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
    builder
      .addRadio({
        path: 'columnMode',
        name: 'Column Mode',
        category: ['Table'],
        settings: {
          options: [
            {
              label: 'Auto',
              value: ColumnMode.AUTO,
            },
            {
              label: 'Manual',
              value: ColumnMode.MANUAL,
            },
          ],
        },
        defaultValue: ColumnMode.AUTO,
      })
      .addCustomEditor({
        id: 'columns',
        path: 'columns',
        name: 'Columns',
        category: ['Table'],
        editor: ColumnsEditor,
        defaultValue: [],
        showIf: (config) => config.columnMode === ColumnMode.MANUAL,
      });

    return builder;
  });
