import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { prompt } from "enquirer";
import { execa } from "execa";
import { ReleaseType } from "semver";
import semverInc from "semver/functions/inc";

import { CmdType, ProgramOptions } from "../types";
import logger from "./logger";

/** 终端运行函数 */
export async function run(bin: string, args: string[], opts = {}) {
  try {
    return await execa(bin, args, { stdio: "inherit", ...opts });
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取node命令 */
export async function getCmds() {
  const cmds: CmdType[] = [];
  if (existsSync("package-lock.json")) {
    cmds.push("npm");
  } else if (existsSync("yarn.lock")) {
    cmds.push("yarn");
  } else if (existsSync("pnpm-lock.yaml")) {
    cmds.push("pnpm");
  }
  return cmds;
}

/** 判断cmd命令是否已安装 */
export async function cmdInstalled(cmd: string) {
  try {
    const { stdout } = await run("which", [cmd], { stdout: "ignore" });
    return !!stdout;
  } catch (error) {
    return false;
  }
}

/** 选择node命令工具 */
export function selectCmd<T extends boolean = true>(
  // eslint-disable-next-line no-unused-vars
  bool?: T
): T extends true ? Promise<CmdType> : Promise<string>;

/** 选择node命令工具 */
// eslint-disable-next-line no-redeclare
export async function selectCmd(needSelection = true) {
  let command: string = "npm";
  const cmds = await getCmds();
  if (cmds.length === 1) {
    command = cmds[0];
  } else if (cmds.length > 1) {
    if (needSelection) {
      const { result } = await prompt<{
        result: string;
      }>({
        type: "select",
        name: "result",
        message: "Select cmd type",
        choices: cmds,
      });
      command = result;
    } else {
      command = `(${cmds.join(" | ")})`;
    }
  }
  return command;
}

/** 创建版本选择函数 */
export const createInc = (preId?: ProgramOptions["preId"]) => {
  const pkgPath = resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  const currentVersion = pkg.version;
  return (i: ReleaseType) => semverInc(currentVersion, i, preId);
};

/** 创建终端运行函数 */
export const createRun = (isTest: ProgramOptions["test"]) => {
  const dryRun = async (bin: string, args: string[], opts = {}) =>
    logger.warn(`[test run] ${bin} ${args.join(" ")}  `, JSON.stringify(opts));
  const runIfNotDry = isTest ? dryRun : run;
  return runIfNotDry;
};

/** 执行步骤log */
export const step = (msg: string) => logger.success("\n", msg);

/** 更新版本号 */
export async function updateVersions(version: string) {
  const pkgPath = resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}
