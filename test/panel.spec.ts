import { test, expect } from '@grafana/plugin-e2e';

import { TEST_IDS } from '../src/constants';
import { getRowCells, getBodyRows, getHeaderCells, getLocatorSelectors } from './helpers';

test.describe('Business Table Panel', () => {
  test('Check grafana version', async ({ grafanaVersion }) => {
    console.log('Grafana version: ', grafanaVersion);
    expect(grafanaVersion).toEqual(grafanaVersion);
  });

  test('Should display a Table', async ({ gotoDashboardPage, readProvisionedDashboard, page }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    await gotoDashboardPage({ uid: dashboard.uid });

    await expect(page.getByRole('heading', { name: 'Table' }).first()).toBeVisible();
  });

  test('Should add a empty Business Table', async ({ gotoDashboardPage, readProvisionedDashboard }) => {
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
    await editPage.apply();

    /**
     * Should add empty visualization without errors
     */
    const panel = await dashboardPage.getPanelByTitle('Business Table Test');
    await expect(panel.getErrorIcon()).not.toBeVisible();
  });

  test('Should render table panel correctly with data', async ({
    gotoDashboardPage,
    page,
    readProvisionedDashboard,
    selectors,
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

    /**
     * Create new table
     */
    await page.getByTestId(TEST_IDS.tablesEditor.newItemName.selector()).fill('Table');
    await page.getByTestId(TEST_IDS.tablesEditor.buttonAddNew.selector()).click();

    await page.getByRole('combobox', { name: 'New Column' }).click();

    /**
     * Options should be correct in field picker
     */
    await expect(editPage.getByGrafanaSelector(selectors.components.Select.option)).toHaveText([
      'A:time',
      'A:A-series',
    ]);

    /**
     * Set columns
     */
    await editPage.getByGrafanaSelector(selectors.components.Select.option).getByText('A:time').click();
    await page.getByTestId(TEST_IDS.columnsEditor.buttonAddNew.selector()).click();
    await page.getByRole('combobox', { name: 'New Column' }).click();
    await editPage.getByGrafanaSelector(selectors.components.Select.option).getByText('A:A-series').click();
    await page.getByTestId(TEST_IDS.columnsEditor.buttonAddNew.selector()).click();

    /**
     * Apply changes and return to dashboard
     */
    await editPage.apply();

    const panel = await dashboardPage.getPanelByTitle('Business Table Test');

    await expect(page.getByRole('heading', { name: 'Table' }).first()).toBeVisible();

    await expect(panel.locator).toBeVisible();
    await expect(panel.getErrorIcon()).not.toBeVisible();

    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('time'))).toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('time'))).toHaveText('time');

    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('A-series'))).toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('A-series'))).toHaveText('A-series');
  });

  test('Should toggle tables via tabs', async ({ gotoDashboardPage, page, readProvisionedDashboard }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

    const panel = await dashboardPage.getPanelByTitle('Groups');

    await expect(page.getByRole('heading', { name: 'Groups' }).first()).toBeVisible();
    await expect(panel.getErrorIcon()).not.toBeVisible();

    const getLocators = getLocatorSelectors({ ...TEST_IDS.panel, ...TEST_IDS.table });
    const locators = getLocators(panel.locator);

    /**
     * Check Tabs
     */
    await expect(locators.tab('Country')).toBeVisible();
    await expect(locators.tab('Country')).toHaveText('Country');
    await expect(locators.tab('Value')).toBeVisible();
    await expect(locators.tab('Value')).toHaveText('Value');

    /**
     * Check Table headings for Country table
     */
    const headerCells = await getHeaderCells(locators.root());
    await expect(headerCells).toHaveLength(4);
    await expect(headerCells[0]).toHaveText('Country');
    await expect(headerCells[1]).toHaveText('City');
    await expect(headerCells[2]).toHaveText('device');
    await expect(headerCells[3]).toHaveText('value');

    /**
     * Switch to Value table
     */
    await locators.tab('Value').click();

    /**
     * Check Table headings for Value table
     */
    await expect(headerCells[0]).toHaveText('device');
    await expect(headerCells[1]).toHaveText('value');

    await expect(locators.headerCell('country')).not.toBeVisible();
    await expect(locators.headerCell('city')).not.toBeVisible();
  });

  test.describe('Download Button', () => {
    test('Should add Download button', async ({
      page,
      gotoDashboardPage,
      readProvisionedDashboard,
      panelEditPage,
      selectors,
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

      /**
       * Download button should not be visible
       */
      await expect(page.getByTestId(TEST_IDS.panel.buttonDownload.selector())).not.toBeVisible();

      /**
       * Download button should be visible
       */
      const showSeriesSwitch = panelEditPage
        .getByGrafanaSelector(selectors.components.PanelEditor.OptionsPane.fieldLabel('Business Table Exportable'))
        .getByLabel('Toggle switch');
      await expect(showSeriesSwitch).toBeVisible();

      await showSeriesSwitch.click();
      await expect(page.getByTestId(TEST_IDS.panel.buttonDownload.selector())).toBeVisible();

      /**
       * Apply changes and return to dashboard
       */
      await editPage.apply();

      /**
       * Download button should be visible on dashboard
       */
      await expect(page.getByTestId(TEST_IDS.panel.buttonDownload.selector())).toBeVisible();
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
      const panel = await dashboardPage.getPanelByTitle('Table');

      await expect(panel.locator).toBeVisible();

      /**
       * Check table header cell with available sort
       */
      await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('id'))).toBeVisible();
      await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('id'))).toHaveText('id');

      /**
       * Check cells in first row
       */
      const row = await getBodyRows(panel.locator.getByTestId(TEST_IDS.table.root.selector()));
      const cells = await getRowCells(row[0]);

      await expect(cells[0]).toHaveText('1');
      await expect(cells[1]).toHaveText('DeviceWithVeryLongTitle');
      await expect(cells[2]).toHaveText('10');

      /**
       * Sort table
       */
      await panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('id')).click();

      /**
       * Cells in first row should be after sort
       */
      await expect(cells[0]).toHaveText('3');
      await expect(cells[1]).toHaveText('Device 3');
      await expect(cells[2]).toHaveText('20');
    });
  });

  test.describe('Filtering', () => {
    test('Should filter table', async ({ page, gotoDashboardPage, readProvisionedDashboard }) => {
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
      const panel = await dashboardPage.getPanelByTitle('Table');

      /**
       * Check table header cell with available filtering
       */
      await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('name'))).toBeVisible();

      /**
       * Should be 3 rows in table body
       */
      const rows = await getBodyRows(panel.locator.getByTestId(TEST_IDS.table.root.selector()));
      await expect(rows).toHaveLength(3);
      /**
       * Should open filter modal popup
       */
      const searchButton = await panel.locator
        .getByTestId(TEST_IDS.table.headerCell.selector('name'))
        .getByTestId(TEST_IDS.tableHeaderCellFilter.root.selector());

      await searchButton.click();
      await expect(page.getByTestId(TEST_IDS.filterPopup.root.selector())).toBeVisible();
      await expect(page.getByTestId(TEST_IDS.filterSearch.root.selector())).toBeVisible();
      await expect(page.getByTestId(TEST_IDS.filterPopup.buttonSave.selector())).toBeVisible();

      /**
       * Apply filter
       */
      await page.getByTestId(TEST_IDS.filterSearch.root.selector()).fill('long');
      await page.getByTestId(TEST_IDS.filterPopup.buttonSave.selector()).click();

      /**
       * Should show one filtering line
       */
      const filteredRows = await getBodyRows(panel.locator.getByTestId(TEST_IDS.table.root.selector()));
      await expect(filteredRows).toHaveLength(1);
    });
  });

  test.describe('Edit cells', () => {
    test('Should edit table cell in row', async ({ readProvisionedDashboard, gotoDashboardPage }) => {
      /**
       * Go To Panels dashboard devices.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'devices.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      /**
       * Get Table panel with enable filtering
       * return dashboardPage
       */
      const panel = await dashboardPage.getPanelByTitle('Devices');

      const rows = await getBodyRows(panel.locator.getByTestId(TEST_IDS.table.root.selector()));
      const cells = await getRowCells(rows[0]);

      const startEditButton = cells[cells.length - 1].getByTestId(TEST_IDS.tableActionsCell.buttonStartEdit.selector());
      const saveButton = cells[cells.length - 1].getByTestId(TEST_IDS.tableActionsCell.buttonSave.selector());
      const cancelButton = cells[cells.length - 1].getByTestId(TEST_IDS.tableActionsCell.buttonCancel.selector());

      await expect(cells).toHaveLength(6);
      await expect(startEditButton).toBeVisible();
      await expect(saveButton).not.toBeVisible();
      await expect(cancelButton).not.toBeVisible();

      /**
       * Check cell before edit
       */
      await expect(cells[cells.length - 2]).toHaveText('Chicago North 125');

      /**
       * Should display editor elements
       */
      await startEditButton.click();

      await expect(saveButton).toBeVisible();
      await expect(cancelButton).toBeVisible();

      await rows[0].getByTestId(TEST_IDS.editableCell.fieldString.selector()).fill('Chicago North 125-test');
      await saveButton.click();

      /**
       * Check cell after edit
       */
      await expect(cells[cells.length - 2]).toHaveText('Chicago North 125-test');
      await expect(cells[cells.length - 2]).not.toHaveText('Chicago North 125');

      await startEditButton.click();
      await rows[0].getByTestId(TEST_IDS.editableCell.fieldString.selector()).fill('Chicago North 125');
      await saveButton.click();
    });
  });

  test.describe('Grouped rows', () => {
    test('Expand rows in group', async ({ gotoDashboardPage, readProvisionedDashboard, page }) => {
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
      const panel = await dashboardPage.getPanelByTitle('Groups');

      /**
       * Should be 2 rows in body
       */
      const rows = await getBodyRows(panel.locator.getByTestId(TEST_IDS.table.root.selector()));
      await expect(rows).toHaveLength(2);

      /**
       * Should be 4 rows in body after click
       */
      const expandButton = await rows[0].getByRole('button');
      await expect(expandButton).toBeVisible();

      await expandButton.click();
      const expandedRows = await getBodyRows(panel.locator.getByTestId(TEST_IDS.table.root.selector()));

      await expect(expandedRows).toHaveLength(4);
    });
  });
});
