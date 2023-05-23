import fs from "node:fs";
import path from "node:path";

import { Options } from "@/types";
import {
  confirmGenerateTag,
  confirmPublishGit,
  confirmReleasing,
  getOptions,
  logger,
  run,
  selectCmd,
  selectReleaseType,
  setOptions,
  step,
} from "@/utils";

const steps = async () => {
  const targetVersion = await selectVersion();
  if (!targetVersion) return;
  await updateVersions(targetVersion);
  await reBuild();
  await pushGit(targetVersion);
};

/** 选择版本号 */
const selectVersion = async () => {
  const pkgPath = path.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const currentVersion = pkg.version;

  const targetVersion = await selectReleaseType(currentVersion);
  // 确认版本号
  const confirmRelease = await confirmReleasing(targetVersion);
  return confirmRelease && targetVersion;
};

/** 更新版本号 */
const updateVersions = async (version: string) => {
  step("Updating package versions...");
  const pkgPath = path.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  logger.log(`Package version updated: ${version}`);
};

/** 重新构建项目 */
const reBuild = async () => {
  step("Updating lockfile...");
  // 选择node命令工具
  const cmd = await selectCmd();
  try {
    await run(cmd, ["install", "--prefer-offline"]);
  } catch (error) {
    await run(cmd, ["install"]);
  }
  step("Rebuilding...");
  // 重新构建
  await run(cmd, ["build"]);
};

/** 提交暂存 */
const pushGit = async (targetVersion: string) => {
  const { commit } = getOptions();
  step("Pushing to GitHub...");
  const result = await run("git", ["diff"], { stdio: "pipe" });
  if (result?.stdout) {
    step("Committing changes...");
    await run("git", ["add", "-A"]);
    await run("git", ["commit", "-m", `${commit}${targetVersion}`]);
  }

  // 确认推送到git
  const publishOk = await confirmPublishGit();
  if (publishOk) {
    await run("git", ["push"]);
    step("Generate & Publish Tag...");

    const tagOk = await confirmGenerateTag(targetVersion);
    if (tagOk) {
      try {
        await run("git", ["tag", `v${targetVersion}`]);
      } catch (error) {
        logger.error((error as Error).stack);
      }
      await run("git", ["push", "origin", `refs/tags/v${targetVersion}`]);
    }
  }
};

const main = async (params: Options) => {
  await setOptions(params);
  await steps();
};

export default main;
