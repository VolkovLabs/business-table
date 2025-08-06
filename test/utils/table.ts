import * as semver from 'semver';
import { Locator } from '@playwright/test';
import { DashboardPage, expect, Panel, PanelEditPage } from '@grafana/plugin-e2e';
import { ACTIONS_COLUMN_ID, TEST_IDS } from '../../src/constants';
import { getLocatorSelectors, LocatorSelectors } from './selectors';
import { ExportFormatType } from '../../src/types';

const getTableSelectors = getLocatorSelectors(TEST_IDS.table);
const getTableEditableCellSelectors = getLocatorSelectors(TEST_IDS.editableCell);

/**
 * Table Filter Helper
 */
class TableFilterHelper {
  private readonly selectors: LocatorSelectors<typeof TEST_IDS.tableHeaderCellFilter>;
  private readonly popupSelectors: LocatorSelectors<typeof TEST_IDS.filterPopup>;
  private readonly searchSelectors: LocatorSelectors<typeof TEST_IDS.filterSearch>;

  constructor(locator: Locator) {
    this.selectors = getLocatorSelectors(TEST_IDS.tableHeaderCellFilter)(locator);
    this.popupSelectors = getLocatorSelectors(TEST_IDS.filterPopup)(locator.page().locator('body'));
    this.searchSelectors = getLocatorSelectors(TEST_IDS.filterSearch)(this.popupSelectors.root());
  }

  public async open() {
    return this.selectors.root().click();
  }

  public async applySearchValue(value: string) {
    await this.open();
    await this.searchSelectors.root().fill(value);
    return this.popupSelectors.buttonSave().click();
  }
}

/**
 * Table Header Cell Helper
 */
class TableHeaderCellHelper {
  private readonly locator: Locator;
  private readonly id: string;
  private readonly nestedSelectors: LocatorSelectors<typeof TEST_IDS.tableHeaderCell>;
  private readonly filterSelectors: LocatorSelectors<typeof TEST_IDS.tableHeaderCellFilter>;

  constructor(
    rowId: number | string,
    id: unknown,
    parentSelectors: LocatorSelectors<Pick<typeof TEST_IDS.table, 'headerCell'>>
  ) {
    this.id = `${id}`;
    this.locator = parentSelectors.headerCell(this.id);
    this.nestedSelectors = getLocatorSelectors(TEST_IDS.tableHeaderCell)(this.locator);
    this.filterSelectors = getLocatorSelectors(TEST_IDS.tableHeaderCellFilter)(this.locator);
  }

  private getMsg(message: string): string {
    return `TableHeaderCell: ${message}`;
  }

  public get() {
    return this.locator;
  }

  public async checkPresence() {
    return expect(this.get(), this.getMsg('Check Presence')).toBeVisible();
  }

  public async checkIfNotPresence() {
    return expect(this.get(), this.getMsg('Check If Not Presence')).not.toBeVisible();
  }

  public async checkText(text: string) {
    return expect(this.get(), this.getMsg('Check Text')).toHaveText(text);
  }

  public async checkIfSortable() {
    return expect(this.nestedSelectors.root()).toHaveCSS('cursor', 'pointer');
  }

  public async toggleSort() {
    return this.nestedSelectors.root().click();
  }

  public async checkSortDir(sort: string) {
    const iconSelector = TEST_IDS.tableHeaderCell.sortIcon.selector(sort === 'asc' ? 'arrow-up' : 'arrow-down');
    return expect(this.locator.getByTestId(iconSelector)).toBeVisible();
  }

  public async checkIfFilterable() {
    return expect(this.filterSelectors.root()).toBeVisible();
  }

  public getFilter() {
    return new TableFilterHelper(this.locator);
  }

  public async canAddRow() {
    return expect(this.nestedSelectors.buttonAddRow()).toBeVisible();
  }

  public async addRow() {
    return this.nestedSelectors.buttonAddRow().click();
  }
}

/**
 * Table Cell Helper
 */
class TableCellHelper {
  private readonly locator: Locator;
  private readonly id: string;

  constructor(
    rowId: number | string,
    id: unknown,
    parentSelectors: LocatorSelectors<Pick<typeof TEST_IDS.table, 'bodyRow' | 'bodyCell'>>
  ) {
    this.id = `${rowId}_${id}`;
    this.locator = parentSelectors.bodyCell(this.id);
  }

  private getMsg(message: string): string {
    return `TableCell: ${message}`;
  }

  public get() {
    return this.locator;
  }

  public async checkPresence() {
    return expect(this.get(), this.getMsg('Check Presence')).toBeVisible();
  }

  public async checkText(text: string) {
    return expect(this.get(), this.getMsg('Check Text')).toHaveText(text);
  }

  public async checkIfEditable() {
    const selectors = getTableEditableCellSelectors(this.get());

    if (selectors.fieldString()) {
      return expect(selectors.fieldString(), this.getMsg('Check If Editable String')).toBeVisible();
    }
  }

  public async changeValue(value: string) {
    const selectors = getTableEditableCellSelectors(this.get());

    if (selectors.fieldString()) {
      return selectors.fieldString().fill(value);
    }

    throw new Error('Unsupported field type');
  }

  public async checkIfExpandable() {
    const selectors = getTableSelectors(this.get());

    await expect(selectors.buttonExpandCell(this.id), this.getMsg('Check If Expandable')).toBeVisible();
  }

  public async toggleExpand() {
    const selectors = getTableSelectors(this.get());

    await selectors.buttonExpandCell(this.id).click();
  }
}

/**
 * Table Actions Cell Helper
 */
class TableActionsCellHelper {
  private readonly locator: Locator;
  private readonly nestedSelectors: LocatorSelectors<typeof TEST_IDS.tableActionsCell>;

  constructor(
    rowId: number | string,
    id: unknown,
    parentSelectors: LocatorSelectors<Pick<typeof TEST_IDS.table, 'bodyRow' | 'bodyCell'>>
  ) {
    this.locator = parentSelectors.bodyCell(`${rowId}_${id}`);
    this.nestedSelectors = getLocatorSelectors(TEST_IDS.tableActionsCell)(this.locator);
  }

  private getMsg(message: string): string {
    return `TableActionsCell: ${message}`;
  }

  public get() {
    return this.locator;
  }

  public async checkPresence() {
    await expect(this.get(), this.getMsg('Check Presence')).toBeVisible();
    await expect(this.nestedSelectors.buttonStartEdit(), this.getMsg('Button Start Edit Presence')).toBeVisible();
  }

  public async checkIfEditing() {
    return expect(this.nestedSelectors.buttonSave()).toBeVisible();
  }

  public async canDelete() {
    return expect(this.nestedSelectors.buttonDelete()).toBeVisible();
  }

  public async delete() {
    return this.nestedSelectors.buttonDelete().click();
  }

  public async startEdit() {
    return this.nestedSelectors.buttonStartEdit().click();
  }

  public async cancelEdit() {
    return this.nestedSelectors.buttonCancel().click();
  }

  public async saveEdit() {
    return this.nestedSelectors.buttonSave().click();
  }
}

/**
 * Table Row Helper
 */
class TableRowHelper {
  private readonly selectors: LocatorSelectors<Pick<typeof TEST_IDS.table, 'bodyRow' | 'bodyCell'>>;

  constructor(
    private readonly locator: Locator,
    public readonly id: number | string,
    private readonly columnId?: string
  ) {
    this.selectors = getTableSelectors(this.locator);
  }

  private getMsg(message: string): string {
    return `TableRow: ${message}`;
  }

  public get() {
    return this.locator;
  }

  public getCell(id: unknown): TableCellHelper {
    return new TableCellHelper(this.id, id, this.selectors);
  }

  public async checkPresence() {
    return expect(this.get(), this.getMsg('Check Presence')).toBeVisible();
  }

  public async checkIfNotPresence() {
    return expect(this.get(), this.getMsg('Check If Not Presence')).not.toBeVisible();
  }

  private getActionsCell() {
    return new TableActionsCellHelper(this.id, ACTIONS_COLUMN_ID, this.selectors);
  }

  public async checkIfEditable() {
    await this.getActionsCell().checkPresence();
  }

  public async checkIfEditing() {
    await this.getActionsCell().checkIfEditing();
  }

  public async startEdit() {
    const actionsCell = this.getActionsCell();

    await actionsCell.startEdit();
  }

  public async cancelEdit() {
    const actionsCell = this.getActionsCell();

    await actionsCell.cancelEdit();
  }

  public async saveEdit() {
    const actionsCell = this.getActionsCell();

    await actionsCell.saveEdit();
  }

  public async checkIfGrouped() {
    return new TableCellHelper(this.id, this.columnId, this.selectors).checkIfExpandable();
  }

  public async toggleExpand() {
    return new TableCellHelper(this.id, this.columnId, this.selectors).toggleExpand();
  }

  public async checkOrder(order: number) {
    const index = await this.locator.getAttribute('data-index');
    return expect(Number(index), this.getMsg('Check Order')).toEqual(order);
  }

  public async canBeDeleted() {
    return this.getActionsCell().canDelete();
  }

  public async delete() {
    return this.getActionsCell().delete();
  }
}

class TableHeaderRowHelper {
  private readonly locator: Locator;
  private readonly selectors: LocatorSelectors<Pick<typeof TEST_IDS.table, 'headerCell' | 'headerRow'>>;

  constructor(
    public readonly id: number | string,
    parentSelectors: LocatorSelectors<typeof TEST_IDS.table>
  ) {
    this.locator = parentSelectors.headerRow(this.id);
    this.selectors = getTableSelectors(this.locator);
  }

  public getHeaderCell(id: unknown): TableHeaderCellHelper {
    return new TableHeaderCellHelper(this.id, id, this.selectors);
  }

  public canAddRow() {
    const actionsCell = new TableHeaderCellHelper(this.id, ACTIONS_COLUMN_ID, this.selectors);

    return actionsCell.canAddRow();
  }

  public addRow() {
    const actionsCell = new TableHeaderCellHelper(this.id, ACTIONS_COLUMN_ID, this.selectors);

    return actionsCell.addRow();
  }
}

/**
 * Table Helper
 */
class TableHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.table>;

  constructor(
    public readonly locator: Locator,
    private readonly panel: Panel
  ) {
    this.selectors = this.getSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `Table: ${msg}`;
  }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Presence')).toBeVisible();
  }

  private getSelectors(locator: Locator) {
    return getTableSelectors(locator);
  }

  public getRow(rowId: number): TableRowHelper {
    const locator = this.selectors.bodyRow(rowId);
    return new TableRowHelper(locator, rowId);
  }

  public getGroupedRow(columnId: string, groupedValue: string, parentRowId?: string | number): TableRowHelper {
    const rowId = `${parentRowId ? parentRowId + '>' : ''}${columnId}:${groupedValue}`;
    const locator = this.selectors.bodyRow(rowId);
    return new TableRowHelper(locator, rowId, columnId);
  }

  public getHeaderRow(rowIndex = 0): TableHeaderRowHelper {
    return new TableHeaderRowHelper(rowIndex, this.selectors);
  }

  public getNewRow(): TableRowHelper {
    const newRowContainer = this.selectors.newRowContainer();
    return new TableRowHelper(newRowContainer, 0);
  }

  public async checkBodyRowsCount(count: number) {
    const rows = await this.locator.locator('tbody').locator('tr').all();

    expect(rows, this.getMsg('Check Body Rows Count')).toHaveLength(count);
  }

  public async compareScreenshot(name: string) {
    return expect(this.selectors.root(), this.getMsg(`Check ${name} Screenshot`)).toHaveScreenshot(name, {
      maxDiffPixelRatio: 0.1,
    });
  }

  public async deleteRow(rowId: number) {
    const row = this.getRow(rowId);

    await row.checkPresence();
    await row.canBeDeleted();
    await row.delete();

    const confirmDeleteButton = this.panel.getByGrafanaSelector(this.panel.ctx.selectors.pages.ConfirmModal.delete);
    await expect(confirmDeleteButton).toBeVisible();
    return confirmDeleteButton.click();
  }
}

/**
 * Table Editor Helper
 */
class TableEditorHelper {
  private readonly tablesSelectors: LocatorSelectors<typeof TEST_IDS.tablesEditor>;
  private readonly selectors: LocatorSelectors<typeof TEST_IDS.tableEditor>;
  private readonly columnsSelectors: LocatorSelectors<typeof TEST_IDS.columnsEditor>;

  constructor(
    private readonly name: string,
    private readonly locator: Locator,
    private readonly editPage: PanelEditPage
  ) {
    this.tablesSelectors = getLocatorSelectors(TEST_IDS.tablesEditor)(locator);
    this.selectors = getLocatorSelectors(TEST_IDS.tableEditor)(this.tablesSelectors.item(name));
    this.columnsSelectors = getLocatorSelectors(TEST_IDS.columnsEditor)(this.tablesSelectors.item(name));
  }

  public async expand() {
    if (!this.tablesSelectors.itemContent(this.name)) {
      await this.tablesSelectors.itemHeader(this.name).click();
    }
  }

  public async addColumn(fieldKey: string) {
    /**
     * Check is current Layout Table editor is open
     * if not we should open it
     */

    const editorHeaderButton = this.tablesSelectors.itemHeader(this.name).getByRole('button').first();
    const ariaLabel = await editorHeaderButton.getAttribute('aria-label');

    if (ariaLabel === 'Expand') {
      await this.tablesSelectors.itemHeader(this.name).click();
    }

    await this.locator.getByRole('combobox', { name: 'New Column' }).click();
    await this.editPage
      .getByGrafanaSelector(this.editPage.ctx.selectors.components.Select.option)
      .getByText(fieldKey)
      .click();
    await this.columnsSelectors.buttonAddNew().click();
  }

  public async toggleColumnVisibility(fieldKey: string) {
    const columnHeader = this.columnsSelectors.itemHeader(fieldKey);

    return getLocatorSelectors(TEST_IDS.columnsEditor)(columnHeader).buttonToggleVisibility().click();
  }
}

/**
 * Panel Editor Helper
 */
class PanelEditorHelper {
  private readonly tablesEditorSelectors: LocatorSelectors<typeof TEST_IDS.tablesEditor>;

  constructor(
    private readonly locator: Locator,
    private readonly editPage: PanelEditPage
  ) {
    this.tablesEditorSelectors = getLocatorSelectors(TEST_IDS.tablesEditor)(this.locator);
  }

  public async addTable(name: string) {
    await this.tablesEditorSelectors.newItemName().fill(name);
    await this.tablesEditorSelectors.buttonAddNew().click();
  }

  public getTableEditor(name: string) {
    return new TableEditorHelper(name, this.locator, this.editPage);
  }

  public async enableDownload(grafanaVersion: string) {
    /**
     * Get Options group Business Table
     */
    const optionGroup = this.editPage.getCustomOptions('Business Table');

    /**
     * Get multiselect element inside group
     */
    const multiselect = optionGroup.getMultiSelect('Table export formats');
    await expect(multiselect.locator()).toBeVisible();

    return await multiselect.selectOptions([ExportFormatType.CSV, ExportFormatType.XLSX], {
      force: true,
    });
  }
}

/**
 * Panel Helper
 */
export class PanelHelper {
  private readonly locator: Locator;
  private readonly selectors: LocatorSelectors<typeof TEST_IDS.panel>;
  private readonly panel: Panel;

  constructor(dashboardPage: DashboardPage, panelTitle: string) {
    this.panel = dashboardPage.getPanelByTitle(panelTitle);
    this.locator = this.panel.locator;
    this.selectors = getLocatorSelectors(TEST_IDS.panel)(this.locator);
  }

  private getMsg(msg: string): string {
    return `Panel: ${msg}`;
  }

  public getTable() {
    return new TableHelper(this.locator, this.panel);
  }

  public getPanelEditor(locator: Locator, editPage: PanelEditPage) {
    return new PanelEditorHelper(locator, editPage);
  }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Presence')).toBeVisible();
  }

  public async checkIfNoErrors() {
    return expect(this.panel.getErrorIcon(), this.getMsg('Check If No Errors')).not.toBeVisible();
  }

  public async checkTabPresence(name: string) {
    return expect(this.selectors.tab(name), this.getMsg('Check Tab Presence')).toBeVisible();
  }

  public async selectTab(name: string) {
    return this.selectors.tab(name).click();
  }

  public async checkDownloadPresence() {
    return expect(this.selectors.buttonDownload(), this.getMsg('Check Download Presence')).toBeVisible();
  }

  public async checkIfDownloadNotPresence() {
    return expect(this.selectors.buttonDownload(), this.getMsg('Check If Download Not Presence')).not.toBeVisible();
  }
}
