export type CaseConf = Record<string, any>;

export type Config = {
  suiteConf: Record<string, any>;
  caseConf: Record<string, any>;
  caseName: string;
  directory?: string;
  fileName?: string;
};