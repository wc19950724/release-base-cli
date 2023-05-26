import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { CmdType } from "@/types";
import { cmdPrompt, getOptions, logger } from "@/utils";

/** 终端运行函数 */
export const run = async (
  bin: string,
  args: string[],
  opts?: Parameters<typeof execSync>[1]
) => {
  const { test, quiet } = getOptions();

  if (test) {
    logger.warn(
      `[test run] ${bin} ${args.join(" ")}  ${opts ? JSON.stringify(opts) : ""}`
    );
    return;
  }

  try {
    const stdout = execSync(`${bin} ${args.join(" ")}`, {
      stdio: quiet ? "ignore" : "inherit",
      ...opts,
      encoding: "utf-8",
    });
    if (stdout && opts?.stdio !== "pipe") {
      logger.log(stdout);
    }
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
