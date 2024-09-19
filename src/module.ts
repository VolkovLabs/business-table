import { PanelPlugin } from '@grafana/data';

import { EditableDataEditor, TablePanel, TablesEditor } from './components';
import { getMigratedOptions } from './migration';
import { PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(TablePanel)
  .useFieldConfig({})
  .setMigrationHandler(getMigratedOptions)
  .setPanelOptions((builder) => {
    builder
      .addBooleanSwitch({
        path: 'toolbar.export',
        name: 'Exportable',
        description: 'Allow to download table data.',
        defaultValue: false,
      })
      .addCustomEditor({
        id: 'tables',
        path: 'tables',
        name: '',
        editor: TablesEditor,
        category: ['Layout'],
        defaultValue: [],
      })
      .addBooleanSwitch({
        path: 'tabsSorting',
        name: 'Tabs Sorting',
        description: 'Show selected tab at the first',
        showIf: (config) => config.tables?.length > 1,
        category: ['Layout'],
      })
      .addCustomEditor({
        id: 'editableData',
        path: 'tables',
        name: '',
        editor: EditableDataEditor,
        category: ['Editable Data'],
        defaultValue: [],
        showIf: (config) => config.tables.length > 0,
      });

    return builder;
  });
