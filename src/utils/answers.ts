import inquirer from "inquirer";
import * as semver from "semver";

import { createInc, getOptions } from "@/utils";

const prompts = inquirer.createPromptModule();

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
  const answers = await prompts<{
    release: semver.ReleaseType | "custom";
    custom: string;
  }>([
    {
      type: "list",
      name: "release",
      message: "\nSelect release type",
      default: "patch",
      pageSize: 10,
      choices: [
        ...Object.keys(incVersion).map((i) => ({
          value: i,
          name: `${i} (${incVersion[i]})`,
        })),
        {
          value: "custom",
          name: "custom",
        },
      ],
    },
    {
      type: "input",
      name: "custom",
      message: "Enter the new version number:",
      default: currentVersion,
      when: (previousAnswer) => previousAnswer.release === "custom",
      validate: (custom) => {
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
  const { yes } = await prompts<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Releasing v${targetVersion}. Confirm?`,
  });
  return yes;
};

/** 确认推送到git */
export const confirmPublishGit = async () => {
  const { quiet } = getOptions();
  if (quiet) return true;
  const { yes } = await prompts<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Publish to Git?`,
  });
  return yes;
};

/** 确认同步标签 */
export const confirmGenerateTag = async (targetVersion: string) => {
  const { quiet } = getOptions();
  if (quiet) return true;
  const { yes } = await prompts<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Generate & Publish Tag: v${targetVersion}?`,
  });
  return yes;
};
