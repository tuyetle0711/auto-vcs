import { CommonPage } from "@pages/page";
import { Page } from "@playwright/test";
export class ZeroConfigPage extends CommonPage {
  constructor(page: Page, domain: string) {
    super(page, domain);
  }

  /**
   * Go to zero configuration page
   */
  async gotoZeroConfigPage(): Promise<void> {
    await this.goto(`/examples/basic_init/zero_configuration.html`);
  }

  /**
   * Sort table by column
   * @param column is comlunn name
   * @param sortType is "descending" or "ascending"
   */
  async sortTableByColumn(
    column: string,
    sortType: "descending" | "ascending"
  ): Promise<void> {
    const xpathColumn = `//th[contains(@aria-label, '${column}')]`;

    // Click on the column header to sort the table
    await this.page.click(xpathColumn);

    // Check sort type to sort following condition
    if (sortType !== (await this.page.getAttribute(xpathColumn, "aria-sort"))) {
      await this.page.click(xpathColumn);
    }
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Click on paging button
   * @param page page number
   */
  async clickOnPagingButton(page: number): Promise<void> {
    if (page > 1) {
      await this.clickOnElement(`//button[@class='dt-paging-button'][${page}]`);
    }
  }
}
