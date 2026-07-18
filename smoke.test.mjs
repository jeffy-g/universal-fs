
/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file universal-fs/smoke.test.mjs
 * @command node smoke.test.mjs
 */

import {
  selectFromEnv,
  UniversalFsError,
  isUFSError
} from "./dist/index.js";


const log = console.log;
// selectFromEnv
let isOK = selectFromEnv("UFS_ENV_TEST", selected => selected === "ok");
log(`UFS_ENV_TEST is not set: ${isOK}`);
process.env.UFS_ENV_TEST = "ok";
isOK = selectFromEnv("UFS_ENV_TEST", selected => selected === "ok");
log(`UFS_ENV_TEST is set: ${isOK}`);

// UniversalFsError
const e = new UniversalFsError("test");
log("e is UniversalFsError instace? - ", isUFSError(e));
