import {
  BrowserContext,
  expect,
  FrameLocator,
  Locator,
  Page,
} from "@playwright/test";

export class CommonPage {
  page: Page;
  readonly domain: string;

  constructor(page: Page, domain: string) {
    this.page = page;
    this.domain = domain;
  }

  genLoc(selector: string) {
    return this.page.locator(selector);
  }

  async goto(path = "", useRouter = false) {
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
   */
  async getTextContent(locator: string, page = this.page): Promise<string> {
    return (await page.locator(locator).textContent()).trim();
  }

  /**
   * Wait until element is visible
   */
  async waitUntilElementVisible(locator: string, timeout = 3000) {
    await expect(this.page.locator(locator)).toBeVisible({ timeout: timeout });
  }

  /**
   * @deprecated use function waitUntilElementInvisibleNew
   */
  async waitUntilElementInvisible(locator: string) {
    await expect(this.page.locator(locator)).toBeHidden({ timeout: 20000 });
  }

  /**
   * Wait element in some milisecond before check is it visible or not
   * Only using this function when you have no choice. Prefer using isVisible() as normally
   * @param xpath element that you want to verify
   * @param timeout by default is 1000 milisecond
   * @returns boolean
   */
  async isElementVisibleWithTimeout(
    xpath: string,
    timeout = 1000
  ): Promise<boolean> {
    const waitTime = new Promise((resolve) => setTimeout(resolve, timeout));
    await waitTime;
    return await this.page.locator(xpath).isVisible();
  }

  async clickElementAndNavigateNewTab(
    context: BrowserContext,
    locator: Locator
  ) {
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      locator.click(), // Opens a new tab
    ]);
    await newPage.waitForLoadState("load");

    return newPage;
  }

  async clickElementWithLabel(typeXpath: string, labelName: string, order = 1) {
    const xpath = `(//${typeXpath}[normalize-space()='${labelName}'])[${order}]`;
    await this.genLoc(xpath).scrollIntoViewIfNeeded();
    await this.page.click(xpath);
  }

  /**
   * get data table by column and row
   * @param tableIndex is table's index
   * @param column is column's index
   * @param row is row's index
   *  return data of table
   */
  async getDataTable(
    tableIndex: number,
    column: number,
    row: number
  ): Promise<string> {
    const xpath = `(//table/tbody)[${tableIndex}]/tr[${column}]/td[${row}]`;
    return await this.genLoc(xpath).innerText();
  }

  async countNumberOfRows(tableIndex: number) {
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

  /*
   * get data by row's label, default get the 1st column
   * param: label
   */
  async getDataByRowLabel(label: string): Promise<string> {
    let data: string;
    let i = 1;
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector(
      "//h4[normalize-space()='Detail']//following-sibling::div[@class='d-flex']"
    );
    const xpathTitle = `//div[@class='p-b' and normalize-space()='${label}']`;
    const xpathRow = `${xpathTitle}//preceding-sibling::div`;
    const row = this.page.locator(xpathRow);
    const rowIndex = (await row.count()) + 1;
    const xpathData = `(${xpathTitle}/../following-sibling::div//div)[${rowIndex}]`;
    await this.page.waitForSelector(xpathData);
    try {
      await this.page.locator(xpathData).isVisible();
    } catch (e) {
      await Promise.resolve();
    }
    do {
      data = await this.getTextContent(xpathData);
      i++;
    } while (data === "" && i <= 10);
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

  /**
   * Check a text content is visible
   * @param text
   * @returns
   */
  async isTextVisible(
    text: string,
    index = 1,
    timeout = 3000
  ): Promise<boolean> {
    const xpath = `(//*[contains(text(),"${text}")])[${index}]`;
    return await this.checkElementAttached(xpath, null, timeout);
  }

  /**
   * get all content of element
   * @param element
   */
  async getAllTextContents(element: string): Promise<Array<string>> {
    return await this.genLoc(element).allTextContents();
  }

  /**
   * Validate the existence of the element on DOM, return true or false with timeout
   * @param xpath
   * @param frameParent: in case xpath is in iframe
   * @param timeout
   */
  async checkElementAttached(
    xpath: string,
    frameParent?: Page | FrameLocator | null,
    timeout = 100
  ): Promise<boolean> {
    try {
      const element = frameParent
        ? frameParent.locator(xpath)
        : this.page.locator(xpath);
      await expect(element).toBeAttached({ timeout: timeout });
      return true;
    } catch (error) {
      return false;
    }
  }
}
