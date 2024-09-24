import { test, expect, PanelEditPage } from '@grafana/plugin-e2e';

import { TEST_IDS } from '../src/constants';

test.describe('Business Table Panel', () => {
  test('Check grafana version', async ({ grafanaVersion }) => {
    console.log('Grafana version: ', grafanaVersion);
    expect(grafanaVersion).toEqual(grafanaVersion);
  });

  test('Should display a Table', async ({ gotoDashboardPage, page }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    await gotoDashboardPage({ uid: 'O4tc_E6Gz' });

    await expect(page.getByRole('heading', { name: 'Table' }).first()).toBeVisible();
  });

  test('Should add a empty Business Table', async ({ gotoDashboardPage, dashboardPage }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    await gotoDashboardPage({ uid: 'O4tc_E6Gz' });

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

  test('Should toggle tables via tabs', async ({ gotoDashboardPage, page, dashboardPage, selectors }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    await gotoDashboardPage({ uid: 'O4tc_E6Gz' });

    const panel = await dashboardPage.getPanelByTitle('Groups');

    await expect(page.getByRole('heading', { name: 'Groups' }).first()).toBeVisible();
    await expect(panel.getErrorIcon()).not.toBeVisible();

    /**
     * Check Tabs
     */
    await expect(panel.locator.getByTestId(TEST_IDS.panel.tab.selector('Country'))).toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.panel.tab.selector('Country'))).toHaveText('Country');
    await expect(panel.locator.getByTestId(TEST_IDS.panel.tab.selector('Value'))).toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.panel.tab.selector('Value'))).toHaveText('Value');

    /**
     * Check Table headings for Country table
     */
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('country'))).toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('country'))).toHaveText('Country');
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('city'))).toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('city'))).toHaveText('City');
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('device'))).toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('device'))).toHaveText('device');
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('value'))).toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('value'))).toHaveText('value');

    /**
     * Switch to Value table
     */
    await panel.locator.getByTestId(TEST_IDS.panel.tab.selector('Value')).click();

    /**
     * Check Table headings for Value table
     */
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('device'))).toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('device'))).toHaveText('device');
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('value'))).toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('value'))).toHaveText('value');

    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('country'))).not.toBeVisible();
    await expect(panel.locator.getByTestId(TEST_IDS.table.headerCell.selector('city'))).not.toBeVisible();
  });
});

test.describe('Download Button', () => {
  test('Should add Download button', async ({ page, gotoDashboardPage, dashboardPage, panelEditPage, selectors }) => {
    /**
     * Go To Panels dashboard devices.json
     * return dashboardPage
     */
    await gotoDashboardPage({ uid: 'edxke3hyi04cgc' });

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
  test('Should sort table rows', async ({ gotoDashboardPage, dashboardPage }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    await gotoDashboardPage({ uid: 'O4tc_E6Gz' });

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
    const cells = await panel.locator
      .getByTestId(TEST_IDS.table.root.selector())
      .locator('tbody')
      .locator('tr')
      .first()
      .locator('td')
      .all();

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
