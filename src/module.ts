import { PanelPlugin } from '@grafana/data';

import { GroupsEditor, TablePanel } from './components';
import { PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(TablePanel).useFieldConfig({}).setPanelOptions((builder) => {
  builder.addCustomEditor({
    id: 'groups',
    path: 'groups',
    name: 'Column Groups',
    editor: GroupsEditor,
  });

  return builder;
});
