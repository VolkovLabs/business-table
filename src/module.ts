import { PanelPlugin } from '@grafana/data';

import { TablePanel } from './components';
import { PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(TablePanel).setPanelOptions((builder) => {
  builder.addFieldNamePicker({
    path: 'name',
    name: 'Field name',
    description: 'Name of the field with data.',
  });

  return builder;
});
