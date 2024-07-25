import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import { rndString } from "@utils/string";
import * as fs from "fs";
import * as dotenv from "dotenv";

const runningObj = Object.create({});
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

let loadedFrom = "";
const runningId = rndString(20);

if (process.env.CI_ENV) {
  loadedFrom = "ci";
  process.env.ENV = process.env.CI_ENV;
} else {
  loadedFrom = "local";
  // only load dotenv if
  dotenv.config();
}

runningObj.env = process.env.ENV;

let { outputDir, reportDir } = {
  outputDir: "/tmp/autopilot/output",
  reportDir: "/tmp/autopilot/reports",
};
if (process.env.RESULT_OUTPUT) {
  outputDir = `${process.env.RESULT_OUTPUT}_${runningId}`;
}
runningObj.outputDir = outputDir;

if (process.env.REPORT_OUTPUT) {
  reportDir = `${process.env.REPORT_OUTPUT}_${runningId}`;
}
runningObj.reportDir = reportDir;
/**
 * See https://playwright.dev/docs/test-configuration.
 */
let config: PlaywrightTestConfig;
const defaultUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/101.0.4951.15 Safari/537.36";

const localConfig: PlaywrightTestConfig = {
  /* Maximum time one test can run for. */
  timeout: 150 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 60000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 0 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 3 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 60000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on",
    headless: false,
    ignoreHTTPSErrors: false,
    permissions: ["clipboard-read", "clipboard-write"],
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 1440,
          height: 900,
        },
        userAgent: defaultUserAgent,
      },
    },
  ],
  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: outputDir,
};

const devConfig: PlaywrightTestConfig = {
  timeout: 300 * 1000 * 2,
  expect: {
    timeout: 15 * 1000 * 2,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 0 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: "html",
  use: {
    actionTimeout: 30 * 1000 * 2,
    trace: "on",
    headless: false,
    ignoreHTTPSErrors: false,
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 1420,
          height: 1080
        },
        userAgent: defaultUserAgent,
      },
    },
  ],
  outputDir: outputDir,
};

const prodConfig: PlaywrightTestConfig = {
  timeout: 150 * 1000 * 2,
  expect: {
    timeout: 15 * 1000 * 2,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: "html",
  use: {
    actionTimeout: 55 * 1000 * 2,
    trace: "on",
    headless: false,
    ignoreHTTPSErrors: false,
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 2560,
          height: 1664,
        },
        userAgent: defaultUserAgent,
      },
    },
  ],
  outputDir: outputDir,
};

switch (process.env.ENV) {
  case "dev":
    config = devConfig;
    runningObj.conf = "dev";
    break;
  case "prod":
    config = prodConfig;
    runningObj.conf = "prod";
    break;
}

if (process.env.CI_ENV) {
  config.use.headless = false;
}

// eslint-disable-next-line no-console
console.log(
  `Running test with the following params: ${JSON.stringify(runningObj)}`
);

export default config;
