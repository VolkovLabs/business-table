import { PanelPlugin } from '@grafana/data';

import { TablePanel, TablesEditor } from './components';
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
      .addCustomEditor({
        id: 'tables',
        path: 'tables',
        name: 'Tables',
        editor: TablesEditor,
      })
      .addBooleanSwitch({
        path: 'tabsSorting',
        name: 'Tabs Sorting',
        description: 'Show selected tab at the first',
        showIf: (config) => config.tables?.length > 1,
      });

    return builder;
  });
