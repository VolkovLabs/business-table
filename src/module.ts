import { PanelPlugin } from '@grafana/data';

import { GroupsEditor, TablePanel } from './components';
import { getMigratedOptions } from './migration';
import { PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(TablePanel)
  .useFieldConfig({})
  .setMigrationHandler(getMigratedOptions)
  .setPanelOptions((builder) => {
    builder.addCustomEditor({
      id: 'groups',
      path: 'groups',
      name: 'Column Groups',
      editor: GroupsEditor,
    });

    return builder;
  });
