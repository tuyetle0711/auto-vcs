import { test } from "@core/fixtures";
import { ZeroConfigPage } from "@pages/ui/zero-config-page";

test.describe("Feature zero configuation", async () => {
  let zeroConfigPage: ZeroConfigPage;
  let pageNumber: number;
  let sortColumn: string;
  let sortType: any;

  test.beforeEach(async ({ conf, page }) => {
    zeroConfigPage = new ZeroConfigPage(page, conf.suiteConf.domain);
    pageNumber = conf.caseConf.page_number;
    sortColumn = conf.caseConf.sort_column;
    sortType = conf.caseConf.sort_type;

    await test.step(`Truy cập https://datatables.net/examples/basic_init/zero_configuration.html`, async () => {
      await zeroConfigPage.gotoZeroConfigPage();
    });
  });

  test(`Test case 1 @TC_01`, async ({ conf }) => {
    await test.step(`Sort theo cột "Start date", thứ tự tăng dần`, async () => {
      await zeroConfigPage.sortTableByColumn(sortColumn, sortType);
    });

    await test.step(`Truy cập vào từng trang (5 trang đầu), khi tìm được hàng mà có cột "Age" lớn hơn
    30 và nhỏ hơn 40 thì in giá trị cột "Name" ra console`, async () => {
      const minAge = conf.caseConf.min_age;
      const maxAge = conf.caseConf.max_age;

      for (let i = 1; i <= pageNumber; i++) {
        await zeroConfigPage.clickOnPagingButton(i);
        const countRows = await zeroConfigPage.countNumberOfRows(1);
        for (let j = 1; j <= countRows; j++) {
          const age = parseInt(
            await zeroConfigPage.getDataByColumnLabel("Age", j)
          );
          if (age > minAge && age < maxAge) {
            const name = await zeroConfigPage.getDataByColumnLabel("Name", j);
            console.log(name);
          }
        }
      }
    });
  });

  test(`Test case 2 @TC_02`, async ({}) => {
    await test.step(`Sort theo cột "Salary", thứ tự giảm dần`, async () => {
      await zeroConfigPage.sortTableByColumn(sortColumn, sortType);
    });

    await test.step(`Truy cập vào từng trang (5 trang đầu), khi tìm được hàng mà có cột "Age" kết
    thúc bằng số 9 (ví dụ 19, 29, ...) thì in giá trị cột "Name" ra console`, async () => {
      for (let i = 1; i <= pageNumber; i++) {
        await zeroConfigPage.clickOnPagingButton(i);
        const countRows = await zeroConfigPage.countNumberOfRows(1);
        for (let j = 1; j <= countRows; j++) {
          const age = await zeroConfigPage.getDataByColumnLabel("Age", j);
          if (age.endsWith("9")) {
            const name = await zeroConfigPage.getDataByColumnLabel("Name", j);
            console.log(name);
          }
        }
      }
    });
  });
});
