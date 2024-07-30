import { PanelPlugin } from '@grafana/data';

import { ColumnsEditor, TablePanel } from './components';
import { ColumnMode, PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(TablePanel).useFieldConfig({}).setPanelOptions((builder) => {
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
