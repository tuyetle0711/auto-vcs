import { test as base } from "@playwright/test";
import { extractCodeName } from "@core/utils/string";
import { ConfigImpl } from "@core/conf";

import type {
  CaseConf,
  Config,
} from "@types";

export const test = base.extend<{
  conf: Config;
  cConf: CaseConf;
}>({
  // all conf
  conf: [
    async ({}, use, testInfo) => {
      const codeNames = extractCodeName(testInfo.title);
      if (codeNames.length !== 1) {
        throw new Error(
          "Invalid code name." +
            "Please attach code name to your test with the format @TC_<codename>",
        );
      }
      const conf = new ConfigImpl(testInfo.file, codeNames[0]);
      conf.loadConfig();
      await use(conf);
    },
    { scope: "test" },
  ],
  // case conf
  cConf: [
    async ({ conf }, use) => {
      await use(conf.caseConf);
    },
    { scope: "test" },
  ]
});

export { expect, request } from "@playwright/test";
