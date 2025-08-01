/**
 * @file universal-fs/tests/utils.ts
 */
export const IMPORT_ROOT = "../dist";
const suffix = "";
export const PKG_JSON_PATH = `./${suffix}package.json`;
export const LOCAL_TEXT_PATH = `./${suffix}project-tree.txt`;
/**
 * ```
 * /Unsupported format: .+, Supported:/i;
 * ```
 */
export const RE_FORMAT_ERR = /Unsupported format: .+, Supported:/i;
/**
 * ```
 * /Invalid JSON format/i
 * ```
 */
export const RE_INVALID_FORMAT = /Invalid JSON format/i;
export const JSDELIVR_ICON_URL = "https://www.jsdelivr.com/assets/9f8e3beccaf9a8a6c4efc8ad9e646f7076d0c929/img/icons/jsdelivr_icon.svg";

export const toLocalOutPath = (fileName: string) => `./tmp/tests/${fileName}`;

