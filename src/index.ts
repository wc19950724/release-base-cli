import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { program } from "commander";
import prerelease from "semver/functions/prerelease";
import valid from "semver/functions/valid";

import { ProgramOptions } from "./types";
import {
  confirmGeneratedChangelog,
  confirmGenerateTag,
  confirmPublishGit,
  confirmReleasing,
  inputCustomVersion,
  selectReleaseType,
} from "./utils/enquirer";
import logger from "./utils/logger";
import { createRun, run, selectCmd, step, updateVersions } from "./utils/utils";

let pkgPath = resolve(process.cwd(), "package.json");
let pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const currentVersion = pkg.version;

program.name(pkg.name).version(currentVersion);
program
  .option(
    "-p, --preId <preId>",
    "example: release-cli -p (alpha | beta | rc | ...)"
  )
  .option("-t, --test", "example: release-cli -t")
  .parse(process.argv);

const options = program.opts<ProgramOptions>();

const preId = options.preId || prerelease(currentVersion)?.[0]?.toString();
const isTest = !!options.test;

const runIfNotDry = createRun(isTest);

async function main() {
  let targetVersion = "";

  // 选择发布类型
  const release = await selectReleaseType(preId);

  if (release === "custom") {
    // 输入自定义版本
    const version = await inputCustomVersion(currentVersion);
    targetVersion = version;
  } else {
    const releaseMatchArray = release.match(/\((.*)\)/);
    if (releaseMatchArray?.length) {
      targetVersion = releaseMatchArray[1];
    } else {
      throw new Error("Version is required!");
    }
  }

  if (!valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`);
  }

  // 确认版本号
  const confirmRelease = await confirmReleasing(targetVersion);

  if (!confirmRelease) return;

  step("Updating package versions...");
  // 更新版本号
  await updateVersions(targetVersion);
  logger.log("Package version updated: ", targetVersion);

  step("Generating changelog...");
  const changelogArgs = [
    "standard-changelog",
    "-i",
    "CHANGELOG.md",
    "-s",
    "-r",
    "0",
  ];
  await run("npx", changelogArgs);
  // 确认同步日志
  const changelogOk = await confirmGeneratedChangelog();
  if (!changelogOk) return;

  step("Updating lockfile...");
  // 选择node命令工具
  const cmd = await selectCmd();
  try {
    await run(cmd, ["install", "--prefer-offline"]);
  } catch (error) {
    await run(cmd, ["install"]);
  }
  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    step("Committing changes...");
    await runIfNotDry("git", ["add", "-A"]);
    await runIfNotDry("git", ["commit", "-m", `release: v${targetVersion}`]);
  } else {
    logger.info("No changes to commit.");
  }

  step("Pushing to GitHub...");

  // 确认推送到git
  const publishOk = await confirmPublishGit();
  if (publishOk) {
    await runIfNotDry("git", ["push"]);
    step("Generate & Publish Tag...");

    const tagOk = await confirmGenerateTag(targetVersion);
    if (tagOk) {
      await runIfNotDry("git", ["tag", `v${targetVersion}`]);
      await runIfNotDry("git", [
        "push",
        "origin",
        `refs/tags/v${targetVersion}`,
      ]);
    }
  }

  if (isTest) {
    logger.success(`\nDry run finished - run git diff to see package changes.`);
  }
}

main().catch(async (err) => {
  // 更新版本号
  await updateVersions(currentVersion);
  logger.error("\n", err);
  process.exit(1);
});
