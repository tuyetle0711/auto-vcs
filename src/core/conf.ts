import path from "path";
import fs from "fs";
import merge from "lodash.merge";

export class ConfigImpl {
  fileName: string;
  caseName: string;
  directory: string;
  suiteConf: Record<string, any>;
  caseConf: Record<string, any>;
  loaded: boolean;
  constructor(directory: string, caseName: string) {
    let dirName = directory;
    if (path.extname(directory) === ".ts") {
      dirName = path.dirname(directory);
      this.fileName = path.basename(directory, ".spec.ts") || "";
    }

    this.directory = dirName;
    this.caseName = caseName;
    this.loaded = false;
  }

  /**
   * Set config
   * @returns
   */
  private setConfig(file) {
    const originalConf = require(path.join(this.directory, file));
    const config = { ...originalConf };
    const newCases = config["cases"];
    delete config["cases"];
    this.suiteConf = merge(this.suiteConf, config);
    if (newCases !== undefined) {
      this.suiteConf["cases"] = merge(this.suiteConf["cases"], newCases);
    }
  }

  /**
   * Load config from file
   * @returns
   */
  loadConfig() {
    // 1. list all .json files
    // 2. load all to config object
    const files = fs.readdirSync(this.directory);
    let isSetConfig = false;

    if (this.fileName) {
      const file = files.find((file) => {
        const extension = path.extname(file);
        const isJsonFile = extension === ".json";
        const fileName = path.basename(file, extension);
        return fileName === this.fileName && isJsonFile;
      });

      if (file) {
        this.setConfig(file);
        isSetConfig = true;
      }
    }

    if (!isSetConfig) {
      files
        .filter((file) => path.extname(file) === ".json")
        .forEach((file) => {
          this.setConfig(file);
        });
    }

    if (
      this.caseName !== undefined &&
      this.caseName !== "" &&
      this.suiteConf &&
      this.suiteConf["cases"] !== undefined
    ) {
      this.caseConf = this.suiteConf["cases"][this.caseName] || {};
    } else {
      throw new Error("Cannot find config for the test case " + this.caseName);
    }
    this.caseConf = this.caseConf || {};

    const envs = this.suiteConf["env"];
    delete this.suiteConf["env"];

    const env = process.env.ENV;

    const tmpEnv =
      envs && envs[env] ? JSON.parse(JSON.stringify(envs[env])) : undefined;
    const envCases = tmpEnv ? tmpEnv["cases"] : undefined;

    if (tmpEnv) {
      if (!tmpEnv.is_merge_case_data) {
        delete tmpEnv["cases"];
      }
      //overwrite
      this.suiteConf = merge(this.suiteConf, tmpEnv);
      if (envCases && envCases[this.caseName]) {
        this.caseConf = merge(this.caseConf, envCases[this.caseName]);
      }
    }

    this.loaded = true;
  }
}
