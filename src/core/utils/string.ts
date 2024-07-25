/**
 * Extract codename from test's description. a code name will begin with @TC_
 * @param testDescriptions
 * @returns
 */
export function extractCodeName(testDescriptions: string) {
    const result = testDescriptions
      .split(/(\s+)/)
      .filter(str => /^@TC_/.test(str))
      .map(str => str.replace(/@/, ""));
    return result;
  }

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const charLength = characters.length;
  export function rndString(length: number) {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
  }