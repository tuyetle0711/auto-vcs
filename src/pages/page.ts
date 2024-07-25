import { Page } from "@playwright/test";

export class CommonPage {
  page: Page;
  readonly domain: string;

  constructor(page: Page, domain: string) {
    this.page = page;
    this.domain = domain;
  }

  /**
   * Go to page with path
   * @param path
   */
  async goto(path = "", useRouter = false): Promise<void> {
    if (useRouter) {
      await this.page.evaluate((routerPath) => {
        return (window as any)
          .registerPlugin()
          .config.globalProperties.$router.push(`${routerPath}`);
      }, `/${path}`.replace(/([^:]\/)\/+/g, "$1"));
      return;
    }

    let url =
      "https://" + (this.domain + "/" + path).replace(/([^:]\/)\/+/g, "$1");
    if (path.startsWith("http")) {
      url = path;
    }

    await this.page.goto(url);
    await this.page.waitForLoadState("load");
  }
  /**
   * Get text content
   * @param locator
   * @returns
   */
  async getTextContent(locator: string, page = this.page): Promise<string> {
    return (await page.locator(locator).textContent()).trim();
  }

  /**
   * Count number of rows
   * @param tableIndex index of table
   * @returns
   */
  async countNumberOfRows(tableIndex: number): Promise<number> {
    return await this.page
      .locator(`(//table//tbody)[${tableIndex}]//tr`)
      .count();
  }

  /**
   * Get data by column's label
   * @param label column's lable
   * @param rowIndex index of row
   * @returns
   */
  async getDataByColumnLabel(label: string, rowIndex = 1): Promise<string> {
    const xpathRow = this.page.locator(
      `//tr//th[contains(@aria-label,'${label}')]/preceding-sibling::th`
    );
    const colIndex = (await xpathRow.count()) + 1;
    const xpathData = `(//table/tbody//tr[${rowIndex}]//td[${colIndex}])`;
    const data = await this.getTextContent(xpathData);
    return data;
  }

  /**
   * Click on element
   * @param selector is selector of element
   * @param iframe if selector is in other frame
   */
  async clickOnElement(selector: string, iframe?: string): Promise<void> {
    if (iframe) {
      const box = await this.page
        .frameLocator(iframe)
        .locator(selector)
        .boundingBox();
      await this.page.frameLocator(iframe).locator(selector).click({});
    } else {
      await this.page.locator(selector).click({ delay: 200 });
    }
  }
}
