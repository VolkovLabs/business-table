import { test, expect } from '@grafana/plugin-e2e';

test.describe('Business Table Panel', () => {
  test('Check grafana version', async ({ grafanaVersion }) => {
    console.log('Grafana version: ', grafanaVersion);
    expect(grafanaVersion).toEqual(grafanaVersion);
  });

  test('Should display a Table', async ({ gotoDashboardPage, page, gotoPanelEditPage }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    await gotoDashboardPage({ uid: 'O4tc_E6Gz' });

    await expect(page.getByRole('heading', { name: 'Table' }).first()).toBeVisible();
  });
});
