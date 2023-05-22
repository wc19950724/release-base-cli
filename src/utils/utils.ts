import fs from "node:fs";
import path from "node:path";

import { prompt } from "enquirer";
import { execa } from "execa";
import { inc as semverInc, ReleaseType } from "semver";

import { CmdType } from "@/types";
import { getOptions, logger, optionsDefault } from "@/utils";

/** 终端运行函数 */
export const run = async (bin: string, args: string[], opts = {}) => {
  const { quiet } = getOptions();

  try {
    return await execa(bin, args, {
      stdio: quiet ? "ignore" : "inherit",
      ...opts,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

/** 获取node命令 */
export const getCmds = async () => {
  const cmds: CmdType[] = [];
  if (fs.existsSync("package-lock.json")) {
    cmds.push("npm");
  } else if (fs.existsSync("yarn.lock")) {
    cmds.push("yarn");
  } else if (fs.existsSync("pnpm-lock.yaml")) {
    cmds.push("pnpm");
  }
  return cmds;
};

/** 选择node命令工具 */
export const selectCmd = async () => {
  let command: CmdType = "npm";
  const cmds = await getCmds();
  if (cmds.length === 1) {
    command = cmds[0];
  } else if (cmds.length > 1) {
    const { result } = await prompt<{
      result: CmdType;
    }>({
      type: "select",
      name: "result",
      message: "Select cmd type",
      choices: cmds,
    });
    command = result;
  }
  return command;
};

/** 创建版本选择函数 */
export const createInc = (preid?: string) => {
  const pkgPath = path.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const currentVersion: string = pkg.version;
  return (i: ReleaseType) =>
    semverInc(currentVersion, i, preid || optionsDefault.preid) ||
    currentVersion;
};

/** 执行步骤log */
export const step = (msg: string) => {
  const { quiet } = getOptions();
  if (!quiet) logger.success(`\n${msg}`);
};

/** 更新版本号 */
export const updateVersions = async (version: string) => {
  const pkgPath = path.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
};
