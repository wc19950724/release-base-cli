import { prompt } from "enquirer";
import { ReleaseType } from "semver";

import { ProgramOptions } from "../types";
import { createInc } from "./utils";

/** 选择发布类型 */
export async function selectReleaseType(preId?: ProgramOptions["preId"]) {
  const versionIncrements: ReleaseType[] = [
    "patch",
    "minor",
    "major",
    ...((preId
      ? ["prepatch", "preminor", "premajor", "prerelease"]
      : []) as ReleaseType[]),
  ];

  const inc = createInc(preId);

  const { release } = await prompt<{
    release: ReleaseType | "custom";
  }>({
    type: "select",
    name: "release",
    message: "Select release type",
    choices: versionIncrements
      .map((i) => `${i} (${inc(i)})`)
      .concat(["custom"]),
  });
  return release;
}

/** 输入自定义版本 */
export async function inputCustomVersion(currentVersion: string) {
  const { version } = await prompt<{ version: string }>({
    type: "input",
    name: "version",
    message: "Input custom version",
    initial: currentVersion,
  });
  return version;
}

/** 确认版本号 */
export async function confirmReleasing(targetVersion: string) {
  const { yes } = await prompt<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Releasing v${targetVersion}. Confirm?`,
  });
  return yes;
}

/** 确认同步日志 */
export async function confirmGeneratedChangelog() {
  const { yes } = await prompt<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Changelog generated. Does it look good?`,
  });
  return yes;
}

/** 确认推送到git */
export async function confirmPublishGit() {
  const { yes } = await prompt<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Publish to Git?`,
  });
  return yes;
}

/** 确认同步标签 */
export async function confirmGenerateTag(targetVersion: string) {
  const { yes } = await prompt<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Generate & Publish Tag: v${targetVersion}?`,
  });
  return yes;
}
