import { PanelPlugin } from '@grafana/data';
import { getAvailableIcons } from '@grafana/ui';

import {
  AddDataEditor,
  DeleteDataEditor,
  EditableDataEditor,
  ExternalExportEditor,
  HighlightDataEditor,
  NestedObjectsEditor,
  PaginationsEditor,
  TablePanel,
  TablesEditor,
} from './components';
import { EXPORT_FORMAT_OPTIONS, TOOLBAR_BUTTONS_ALIGNMENT } from './constants';
import { getMigratedOptions } from './migration';
import { PanelOptions, ToolbarButtonsAlignment } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(TablePanel)
  .useFieldConfig({})
  .setMigrationHandler(getMigratedOptions)
  .setPanelOptions((builder) => {
    /**
     * Icon Options
     */
    const iconOptions = getAvailableIcons()
      .sort((a, b) => a.localeCompare(b))
      .map((icon) => {
        return {
          value: icon,
          label: icon,
          icon: icon,
        };
      });

    builder
      .addMultiSelect({
        path: 'toolbar.exportFormats',
        name: 'Table export formats',
        description: 'The first selected format is used by default for export. Clear it to hide table exports.',
        settings: {
          options: EXPORT_FORMAT_OPTIONS,
          isClearable: true,
        },
      })
      .addRadio({
        path: 'toolbar.alignment',
        name: 'Toolbar buttons alignment',
        settings: {
          options: TOOLBAR_BUTTONS_ALIGNMENT,
        },
        showIf: (config) => config.tables?.length > 1 || config.toolbar.export,
        defaultValue: ToolbarButtonsAlignment.LEFT,
      })
      .addBooleanSwitch({
        path: 'tabsSorting',
        name: 'Tabs Sorting',
        description: 'Show selected tab first',
        showIf: (config) => config.tables?.length > 1,
      });

    /**
     * Options
     */
    builder
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

    /**
     * Advanced
     */
    builder
      .addBooleanSwitch({
        path: 'saveUserPreference',
        name: 'Save Preferences',
        description: 'Enable to save table settings to User Preferences, overriding current table configuration.',
        category: ['Advanced'],
      })
      .addBooleanSwitch({
        path: 'isColumnManagerAvailable',
        name: 'Column Manager',
        description: 'Allowing column display management in a drawer.',
        category: ['Advanced'],
      })
      .addBooleanSwitch({
        path: 'externalExport.enabled',
        name: 'External export',
        description: 'Allowing external table export',
        category: ['Advanced'],
      });

    /**
     * Column Manager
     */
    builder
      .addBooleanSwitch({
        path: 'showFiltersInColumnManager',
        name: 'Show filters',
        description: 'Allowing set filters for columns.',
        showIf: (config) => config.isColumnManagerAvailable,
        category: ['Column Manager'],
      })
      .addBooleanSwitch({
        path: 'showSortingInColumnManager',
        name: 'Show sorting',
        description: 'Allowing use sorting for columns.',
        showIf: (config) => config.isColumnManagerAvailable,
        category: ['Column Manager'],
      })
      .addBooleanSwitch({
        path: 'isColumnManagerShowCustomIcon',
        name: 'Show Custom Icon',
        description: 'Show custom icon for the column manager button.',
        category: ['Column Manager'],
        showIf: (config) => config.isColumnManagerAvailable,
        defaultValue: false,
      })
      .addSelect({
        path: 'columnManagerNativeIcon',
        name: 'Native Icon',
        description: 'Use native icon for the column manager button.',
        category: ['Column Manager'],
        showIf: (config) => config.isColumnManagerAvailable && !config.isColumnManagerShowCustomIcon,
        settings: {
          options: iconOptions,
        },
        defaultValue: 'table',
      })
      .addTextInput({
        path: 'columnManagerCustomIcon',
        name: 'Custom Icon URL',
        description: 'Custom icon for the column manager button.',
        category: ['Column Manager'],
        showIf: (config) => config.isColumnManagerAvailable && config.isColumnManagerShowCustomIcon,
        defaultValue: '',
      });

    /**
     * External Export
     */
    builder.addCustomEditor({
      id: 'externalExport',
      path: 'externalExport',
      name: '',
      editor: ExternalExportEditor,
      showIf: (config) => config.externalExport?.enabled,
      category: ['External Export'],
    });

    return builder;
  });
