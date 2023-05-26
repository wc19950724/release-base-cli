import fs from "node:fs";
import path from "node:path";

import prompts from "prompts";
import * as semver from "semver";

import { CmdType } from "@/types";
import { getOptions, optionsDefault } from "@/utils";

/** 创建版本选择函数 */
export const createInc = (preid?: string) => {
  const pkgPath = path.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const currentVersion: string = pkg.version;
  return (i: semver.ReleaseType) =>
    semver.inc(currentVersion, i, preid || optionsDefault.preid) ||
    currentVersion;
};

export const getIncVersion = () => {
  const { preid } = getOptions();
  const versionMap: Record<string, string> = {};
  const inc = createInc(preid);

  const versionIncrements: semver.ReleaseType[] = [
    "major",
    "minor",
    "patch",
    "premajor",
    "preminor",
    "prepatch",
    "prerelease",
  ];

  for (const type of versionIncrements) {
    versionMap[type] = inc(type);
  }
  return versionMap;
};

/** 选择发布类型 */
export const selectReleaseType = async (currentVersion: string) => {
  const incVersion = getIncVersion();
  const answers = await prompts([
    {
      type: "autocomplete",
      name: "release",
      message: "\nSelect release type",
      initial: "patch",
      choices: [
        ...Object.keys(incVersion).map((i) => ({
          value: i,
          title: `${i.padStart(10, " ")} (${incVersion[i]})`,
        })),
        {
          value: "custom",
          title: "custom",
        },
      ],
    },
    {
      type: (prev) => (prev === "custom" ? "text" : null),
      name: "custom",
      message: "Enter the new version number:",
      initial: currentVersion,
      validate: (custom: string) => {
        return semver.valid(custom)
          ? true
          : "That's not a valid version number";
      },
    },
  ]);
  if (answers.release === "custom") {
    return answers.custom;
  }
  return incVersion[answers.release];
};

/** 确认版本号 */
export const confirmReleasing = async (targetVersion: string) => {
  const { quiet } = getOptions();
  if (quiet) return true;
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Releasing v${targetVersion}. Confirm?`,
    initial: true,
  });
  return yes;
};

/** 确认推送到git */
export const confirmPublishGit = async () => {
  const { quiet } = getOptions();
  if (quiet) return true;
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Publish to Git?`,
    initial: true,
  });
  return yes;
};

/** 确认同步标签 */
export const confirmGenerateTag = async (targetVersion: string) => {
  const { quiet } = getOptions();
  if (quiet) return true;
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Generate & Publish Tag: v${targetVersion}?`,
    initial: true,
  });
  return yes;
};

/** 选择命令工具 */
export const cmdPrompt = async (cmds: CmdType[]) => {
  const { result } = await prompts({
    type: "list",
    name: "result",
    message: "Select cmd type",
    choices: cmds.map((cmd) => ({
      value: cmd,
      title: cmd,
    })),
  });
  return result;
};
