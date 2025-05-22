import { test, expect } from '@grafana/plugin-e2e';

import { PanelHelper } from './utils';

test.describe('Business Table Panel', () => {
  test('Check grafana version', async ({ grafanaVersion }) => {
    console.log('Grafana version: ', grafanaVersion);
    expect(grafanaVersion).toEqual(grafanaVersion);
  });

  test('Should display a Table', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

    const panel = new PanelHelper(dashboardPage, 'Table');

    /**
     * Check Panel Presence
     */
    await panel.checkPresence();

    /**
     * Check Table Presence
     */
    await panel.getTable().checkPresence();
  });

  test('Should display data for columns with dots', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

    const panel = new PanelHelper(dashboardPage, 'Table');
    const table = panel.getTable();

    /**
     * Check Panel Presence
     */
    await panel.checkPresence();

    /**
     * Check Column Header With Dots
     */
    await table.getHeaderRow().getHeaderCell('comment.info.name').checkPresence();
    await table.getHeaderRow().getHeaderCell('comment.info.name').checkText('comment.info.name');

    /**
     * Check Column Row With Dots
     */
    await table.getRow(0).getCell('comment.info.name').checkPresence();
    await table.getRow(0).getCell('comment.info.name').checkText('Some comment');
    await table.getRow(1).getCell('comment.info.name').checkPresence();
    await table.getRow(1).getCell('comment.info.name').checkText('Some notes');
    await table.getRow(2).getCell('comment.info.name').checkPresence();
    await table.getRow(2).getCell('comment.info.name').checkText('');
  });

  test('Should add an empty Business Table', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

    /**
     * Add new visualization
     */
    const editPage = await dashboardPage.addPanel();
    await editPage.setVisualization('Business Table');
    await editPage.setPanelTitle('Business Table Test');
    await editPage.backToDashboard();

    /**
     * Should add empty visualization without errors
     */
    const panel = new PanelHelper(dashboardPage, 'Business Table Test');
    await panel.checkIfNoErrors();
  });

  test('Should render table panel correctly with data', async ({
    gotoDashboardPage,
    page,
    readProvisionedDashboard,
  }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

    /**
     * Add new visualization
     */
    const editPage = await dashboardPage.addPanel();
    await editPage.setVisualization('Business Table');
    await editPage.setPanelTitle('Business Table Test');

    /**
     * Set data source
     */
    await editPage.datasource.set('Grafana');
    await editPage.refreshPanel();

    const panelNew = new PanelHelper(dashboardPage, 'Business Table Test');
    const editor = panelNew.getPanelEditor(page.locator('body'), editPage);

    /**
     * Create new table
     */
    await editor.addTable('Table');

    const tableEditor = editor.getTableEditor('Table');

    /**
     * Set columns
     */
    await tableEditor.addColumn('A:time');
    await tableEditor.addColumn('A:A-series');

    /**
     * Apply changes and return to dashboard
     */
    await editPage.backToDashboard();

    const panel = new PanelHelper(dashboardPage, 'Business Table Test');

    /**
     * Check Presence
     */
    await panel.checkPresence();
    await panel.checkIfNoErrors();

    /**
     * Check Table
     */
    const table = panel.getTable();
    await table.checkPresence();

    /**
     * Check Header
     */
    const header = table.getHeaderRow();

    await header.getHeaderCell('time').checkPresence();
    await header.getHeaderCell('time').checkText('time');

    await header.getHeaderCell('A-series').checkPresence();
    await header.getHeaderCell('A-series').checkText('A-series');
  });

  test('Should render only visible columns in table', async ({ gotoDashboardPage, page, readProvisionedDashboard }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

    /**
     * Add new visualization
     */
    const editPage = await dashboardPage.addPanel();
    await editPage.setVisualization('Business Table');
    await editPage.setPanelTitle('Business Table Test');

    /**
     * Set data source
     */
    await editPage.datasource.set('Grafana');
    await editPage.refreshPanel();

    const panelNew = new PanelHelper(dashboardPage, 'Business Table Test');
    const editor = panelNew.getPanelEditor(page.locator('body'), editPage);

    /**
     * Create new table
     */
    await editor.addTable('Table');

    const tableEditor = editor.getTableEditor('Table');

    /**
     * Set columns
     */
    await tableEditor.addColumn('A:time');
    await tableEditor.addColumn('A:A-series');

    /**
     * Hide column
     */
    await tableEditor.toggleColumnVisibility('A:A-series');

    /**
     * Apply changes and return to dashboard
     */
    await editPage.backToDashboard();

    const panel = new PanelHelper(dashboardPage, 'Business Table Test');

    /**
     * Check Presence
     */
    await panel.checkPresence();
    await panel.checkIfNoErrors();

    /**
     * Check Table
     */
    const table = panel.getTable();
    await table.checkPresence();

    /**
     * Check Header
     */
    await table.getHeaderRow().getHeaderCell('time').checkPresence();
    await table.getHeaderRow().getHeaderCell('A-series').checkIfNotPresence();
  });

  test('Should toggle tables via tabs', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

    const panel = new PanelHelper(dashboardPage, 'Groups');
    const table = panel.getTable();

    /**
     * Check Tabs
     */
    await panel.checkTabPresence('Country');
    await panel.checkTabPresence('Value');

    /**
     * Check Table headings for Country table
     */
    await table.getHeaderRow().getHeaderCell('country').checkPresence();
    await table.getHeaderRow().getHeaderCell('city').checkPresence();
    await table.getHeaderRow().getHeaderCell('device').checkPresence();
    await table.getHeaderRow().getHeaderCell('value').checkPresence();

    /**
     * Switch to Value table
     */
    await panel.selectTab('Value');

    /**
     * Check Table Headings for Value table
     */
    await table.getHeaderRow().getHeaderCell('device').checkPresence();
    await table.getHeaderRow().getHeaderCell('value').checkPresence();
  });

  test.describe('Download Button', () => {
    test('Should add Download button', async ({
      page,
      gotoDashboardPage,
      readProvisionedDashboard,
      grafanaVersion,
    }) => {
      /**
       * Go To Panels dashboard devices.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'devices.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      /**
       * Add new visualization
       */
      const editPage = await dashboardPage.addPanel();
      await editPage.setVisualization('Business Table');
      await editPage.setPanelTitle('Business Table Test');

      const panel = new PanelHelper(dashboardPage, 'Business Table Test');

      /**
       * Download button should not be visible
       */
      await panel.checkIfDownloadNotPresence();

      /**
       * Enabled Download
       */
      await panel.getPanelEditor(page.locator('body'), editPage).enableDownload(grafanaVersion);

      /**
       * Download button should be visible
       */
      await panel.checkDownloadPresence();

      /**
       * Apply changes and return to dashboard
       */
      await editPage.backToDashboard();

      /**
       * Download button should be visible on dashboard
       */
      await panel.checkDownloadPresence();
    });
  });

  test.describe('Sorting', () => {
    test('Should sort table rows', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
      /**
       * Go To Panels dashboard panels.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      /**
       * Get Table panel with enable sorting
       * return dashboardPage
       */
      const panel = new PanelHelper(dashboardPage, 'Table');
      await panel.checkPresence();

      const table = panel.getTable();

      /**
       * Check table header cell with available sort
       */
      await table.getHeaderRow().getHeaderCell('id').checkPresence();
      await table.getHeaderRow().getHeaderCell('id').checkIfSortable();

      /**
       * Check cells in first row
       */
      await table.getRow(0).checkOrder(0);
      await table.getRow(0).getCell('id').checkText('1');
      await table.getRow(0).getCell('name').checkText('DeviceWithVeryLongTitle');
      await table.getRow(0).getCell('value').checkText('10');

      /**
       * Sort table
       */
      await table.getHeaderRow().getHeaderCell('id').toggleSort();

      /**
       * Check Row Order
       */
      await table.getRow(0).checkOrder(2);

      /**
       * Check Sort Icon Presence
       */
      await table.getHeaderRow().getHeaderCell('id').checkSortDir('desc');
    });
  });

  test.describe('Filtering', () => {
    test('Should filter table', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
      /**
       * Go To Panels dashboard panels.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      /**
       * Get Table panel with enable filtering
       * return dashboardPage
       */
      const panel = new PanelHelper(dashboardPage, 'Table');
      const table = panel.getTable();

      /**
       * Check table header cell with available filtering
       */
      await table.getHeaderRow().getHeaderCell('name').checkPresence();
      await table.getHeaderRow().getHeaderCell('name').checkIfFilterable();

      /**
       * Should be 3 rows in table body
       */
      await table.checkBodyRowsCount(3);

      /**
       * Apply Filter
       */
      const filter = table.getHeaderRow().getHeaderCell('name').getFilter();
      await filter.applySearchValue('long');

      /**
       * Should show one filtering line
       */
      await table.checkBodyRowsCount(1);
    });
  });

  test.describe('Add/Delete row', () => {
    test('Should allow to add and delete new row', async ({ readProvisionedDashboard, gotoDashboardPage }) => {
      /**
       * Go To Panels dashboard devices.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'devices.json' });
      /**
       * Disable scene due until refresh panel data issue is resolved
       */
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      /**
       * Get Table panel
       */
      const panel = new PanelHelper(dashboardPage, 'Devices');

      const table = panel.getTable();
      const headerRow = table.getHeaderRow();

      /**
       * Check if add row enabled
       */
      await headerRow.canAddRow();

      /**
       * Add row
       */
      await headerRow.addRow();

      /**
       * Check if row added
       */
      const newRow = table.getNewRow();
      await newRow.checkPresence();
      await newRow.checkIfEditing();

      /**
       * Fill name
       */
      const nameCell = newRow.getCell('name');
      await nameCell.checkPresence();
      await nameCell.changeValue('Added Device 1');

      /**
       * Check if saved
       */
      await newRow.saveEdit();
      await newRow.checkIfNotPresence();
      const addedRow = table.getRow(16);
      await addedRow.checkPresence();
      await addedRow.getCell('name').checkText('Added Device 1');

      /**
       * Check if row can be deleted
       */
      await addedRow.canBeDeleted();

      /**
       * Delete row
       */
      await table.deleteRow(16);
      await addedRow.checkIfNotPresence();
    });
  });

  test.describe('Edit cells', () => {
    test('Should allow to change string value', async ({ readProvisionedDashboard, gotoDashboardPage }) => {
      /**
       * Go To Panels dashboard devices.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'devices.json' });
      /**
       * Disable scene due until refresh panel data issue is resolved
       */
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      /**
       * Get Table panel
       */
      const panel = new PanelHelper(dashboardPage, 'Devices');

      const table = panel.getTable();
      const firstRow = table.getRow(0);

      /**
       * Check Row Presence
       */
      await firstRow.checkPresence();

      /**
       * Check If Row Editable
       */
      await firstRow.checkIfEditable();

      /**
       * Check Name Value Before Edit
       */
      await firstRow.getCell('name').checkPresence();
      await firstRow.getCell('name').checkText('Chicago North 125');

      /**
       * Start Edit
       */
      await firstRow.startEdit();

      /**
       * Change Value
       */
      await firstRow.getCell('name').checkIfEditable();
      await firstRow.getCell('name').changeValue('Chicago North 125-test');

      /**
       * Save Edit
       */
      await firstRow.saveEdit();

      /**
       * Check Name Value After Edit
       */
      await firstRow.getCell('name').checkText('Chicago North 125-test');

      /**
       * Revert Changes
       */
      await firstRow.startEdit();
      await firstRow.getCell('name').changeValue('Chicago North 125');
      await firstRow.saveEdit();
      await firstRow.getCell('name').checkText('Chicago North 125');
    });

    test('Should not save changes if cancel edit', async ({ readProvisionedDashboard, gotoDashboardPage }) => {
      /**
       * Go To Panels dashboard devices.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'devices.json' });
      /**
       * Disable scene due until refresh panel data issue is resolved
       */
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      /**
       * Get Table panel
       */
      const panel = new PanelHelper(dashboardPage, 'Devices');

      const table = panel.getTable();
      const firstRow = table.getRow(0);

      /**
       * Check Row Presence
       */
      await firstRow.checkPresence();

      /**
       * Check If Row Editable
       */
      await firstRow.checkIfEditable();

      /**
       * Check Name Value Before Edit
       */
      await firstRow.getCell('name').checkPresence();
      await firstRow.getCell('name').checkText('Chicago North 125');

      /**
       * Start Edit
       */
      await firstRow.startEdit();

      /**
       * Change Value
       */
      await firstRow.getCell('name').checkIfEditable();
      await firstRow.getCell('name').changeValue('Chicago North 125-test');

      /**
       * Cancel Edit
       */
      await firstRow.cancelEdit();

      /**
       * Check New Name Value Not Saved
       */
      await firstRow.getCell('name').checkText('Chicago North 125');
    });
  });

  test.describe('Grouped rows', () => {
    test('Expand rows in group', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
      /**
       * Go To Panels dashboard panels.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      /**
       * Get Table panel with enable filtering
       * return dashboardPage
       */
      const panel = new PanelHelper(dashboardPage, 'Rows and Editor');

      const table = panel.getTable();
      const countryUsaRow = table.getGroupedRow('country', 'USA');

      /**
       * Check Row Presence
       */
      await countryUsaRow.checkPresence();

      /**
       * Check Row Grouped
       */
      await countryUsaRow.checkIfGrouped();

      /**
       * Expand
       */
      await countryUsaRow.toggleExpand();

      /**
       * Check If Nested Column Expanded
       */
      const countryUsaNewYorkRow = table.getGroupedRow('city', 'New York', countryUsaRow.id);
      await countryUsaNewYorkRow.checkPresence();

      /**
       * Collapse
       */
      await countryUsaRow.toggleExpand();

      /**
       * Check If Collapsed
       */
      await countryUsaNewYorkRow.checkIfNotPresence();
    });
  });
});
