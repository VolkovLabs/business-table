import { PanelPlugin } from '@grafana/data';

import {
  AddDataEditor,
  DeleteDataEditor,
  EditableDataEditor,
  HighlightDataEditor,
  NestedObjectsEditor,
  PaginationsEditor,
  TablePanel,
  TablesEditor,
} from './components';
import { TOOLBAR_BUTTONS_ALIGNMENT } from './constants';
import { getMigratedOptions } from './migration';
import { PanelOptions, ToolbarButtonsAlignment } from './types';

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
      .addRadio({
        path: 'toolbar.alignment',
        name: 'Toolbar buttons alignment',
        settings: {
          options: TOOLBAR_BUTTONS_ALIGNMENT,
        },
        showIf: (config) => config.tables?.length > 1 || config.toolbar.export,
        defaultValue: ToolbarButtonsAlignment.LEFT,
      });
    builder
      .addBooleanSwitch({
        path: 'tabsSorting',
        name: 'Tabs Sorting',
        description: 'Show selected tab first',
        showIf: (config) => config.tables?.length > 1,
      })
      .addCustomEditor({
        id: 'tables',
        path: 'tables',
        name: '',
        editor: TablesEditor,
        category: ['Layout'],
        defaultValue: [],
        aliasIds: ['nestedObjects'],
      })
      .addCustomEditor({
        id: 'addData',
        path: 'tables',
        name: '',
        editor: AddDataEditor,
        category: ['Add Data'],
        defaultValue: [],
        showIf: (config) => config.tables.length > 0,
      })
      .addCustomEditor({
        id: 'editableData',
        path: 'tables',
        name: '',
        editor: EditableDataEditor,
        category: ['Editable Data'],
        defaultValue: [],
        showIf: (config) => config.tables.length > 0,
      })
      .addCustomEditor({
        id: 'deleteData',
        path: 'tables',
        name: '',
        editor: DeleteDataEditor,
        category: ['Delete Data'],
        defaultValue: [],
        showIf: (config) => config.tables.length > 0,
      })
      .addCustomEditor({
        id: 'highlightData',
        path: 'tables',
        name: '',
        editor: HighlightDataEditor,
        category: ['Highlight Row'],
        defaultValue: [],
        showIf: (config) => config.tables.length > 0,
      })
      .addCustomEditor({
        id: 'pagination',
        path: 'tables',
        name: '',
        editor: PaginationsEditor,
        category: ['Pagination'],
        defaultValue: [],
        showIf: (config) => config.tables.length > 0,
      })
      .addCustomEditor({
        id: 'nestedObjects',
        path: 'nestedObjects',
        name: '',
        editor: NestedObjectsEditor,
        defaultValue: [],
        category: ['Nested Objects'],
      });

    return builder;
  });
