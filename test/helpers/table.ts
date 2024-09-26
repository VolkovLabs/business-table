import { Locator } from '@playwright/test';

export const getHeaderCells = (table: Locator): Promise<Array<Locator>> => {
  return table.locator('thead').locator('tr').first().locator('th').all();
};

export const getBodyRows = (table: Locator): Promise<Array<Locator>> => {
  return table.locator('tbody').locator('tr').all();
};

export const getRowCells = (row: Locator): Promise<Array<Locator>> => {
  return row.locator('td').all();
};
