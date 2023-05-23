import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { CmdType } from "@/types";
import { cmdPrompt, getOptions, logger } from "@/utils";

/** 终端运行函数 */
export const run = async (bin: string, args: string[]) => {
  const { test, quiet } = getOptions();

  if (test) {
    logger.warn(`[test run] ${bin} ${args.join(" ")}`);
    return;
  }

  try {
    const stdout = execSync(`${bin} ${args.join(" ")}`);
    !quiet && console.log(`stdout: ${stdout}`);
    return stdout;
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
    const result = await cmdPrompt(cmds);
    command = result;
  }
  return command;
};

/** 执行步骤log */
export const step = (msg: string) => logger.success(`\n${msg}`);

/** 更新版本号 */
export const updateVersions = async (version: string) => {
  const pkgPath = path.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
};

/** 对齐输出内容 */
export const createFormat = (msgObj: Record<string, string>) => {
  const maxLength = Object.keys(msgObj).reduce((maxLength, key) => {
    return key.length > maxLength ? key.length : maxLength;
  }, 0);
  return (key: string, fillString = " ") => key.padEnd(maxLength, fillString);
};
