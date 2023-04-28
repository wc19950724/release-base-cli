import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { program } from "commander";
import { prompt } from "enquirer";
import { execa } from "execa";
import { ReleaseType } from "semver";
import semverInc from "semver/functions/inc";
import prerelease from "semver/functions/prerelease";
import valid from "semver/functions/valid";

import { ProgramOptions } from "./types";
import logger from "./utils/logger";

let pkgPath = resolve(process.cwd(), "package.json");
let pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const currentVersion = pkg.version;

program.name(pkg.name).version(currentVersion);
program
  .option("-c, --config <config>", "example: release-cli -c ./config.js")
  .option(
    "-p, --preId <preId>",
    "example: release-cli -p (alpha | beta | rc | ...)"
  )
  .option("-t, --test", "example: release-cli -t")
  .parse(process.argv);

const options = program.opts<ProgramOptions>();

const changelogConfig = options.config;
const preId = options.preId || prerelease(currentVersion)?.[0]?.toString();
const isTest = !!options.test;

const cmds: string[] = [];
if (existsSync("package-lock.json")) {
  cmds.push("npm");
} else if (existsSync("yarn.lock")) {
  cmds.push("yarn");
} else if (existsSync("pnpm-lock.yaml")) {
  cmds.push("pnpm");
}

const versionIncrements: ReleaseType[] = [
  "patch",
  "minor",
  "major",
  ...((preId
    ? ["prepatch", "preminor", "premajor", "prerelease"]
    : []) as ReleaseType[]),
];

const inc = (i: ReleaseType) => semverInc(currentVersion, i, preId);
const run = (bin: string, args: string[], opts = {}) => {
  try {
    return execa(bin, args, { stdio: "inherit", ...opts });
  } catch (error) {
    return Promise.reject(error);
  }
};
const dryRun = async (bin: string, args: string[], opts = {}) =>
  logger.warn(`[test run] ${bin} ${args.join(" ")}  `, JSON.stringify(opts));
const runIfNotDry = isTest ? dryRun : run;
const step = (msg: string) => logger.success("\n", msg);

async function main() {
  let targetVersion = "";

  // no explicit version, offer suggestions
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

  if (release === "custom") {
    const { version } = await prompt<{ version: string }>({
      type: "input",
      name: "version",
      message: "Input custom version",
      initial: currentVersion,
    });
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

  const { yes: confirmRelease } = await prompt<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Releasing v${targetVersion}. Confirm?`,
  });

  if (!confirmRelease) return;

  step("Updating package versions...");
  updateVersions(targetVersion);
  logger.log("Package version updated: ", targetVersion);

  // generate changelog
  step("Generating changelog...");
  let configPath = "";
  if (changelogConfig) {
    configPath = resolve(changelogConfig);
  }
  const changelogArgs = [
    "-p",
    "angular",
    "-i",
    "CHANGELOG.md",
    "-s",
    "-r",
    "0",
  ];
  if (configPath) {
    logger.info("changelog config at:\u{1F447}\n\t", configPath);
    changelogArgs.push("-c", configPath);
  }
  await run("conventional-changelog", changelogArgs);

  const { yes: changelogOk } = await prompt<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Changelog generated. Does it look good?`,
  });

  if (!changelogOk) return;

  step("Updating lockfile...");
  let cmd = "npm";
  if (cmds.length === 1) {
    cmd = cmds[0];
  } else if (cmds.length > 1) {
    const { result } = await prompt<{
      result: string;
    }>({
      type: "select",
      name: "result",
      message: "Select cmd type",
      choices: cmds,
    });
    cmd = result;
  }
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

  // push to GitHub
  step("Pushing to GitHub...");
  const { yes: publishOk } = await prompt<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Publish to Git?`,
  });

  if (publishOk) {
    await runIfNotDry("git", ["push"]);
    // Generate & Publish Tag
    step("Generate & Publish Tag...");
    const { yes: tagOk } = await prompt<{ yes: boolean }>({
      type: "confirm",
      name: "yes",
      message: `Generate & Publish Tag: v${targetVersion}?`,
    });

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

function updateVersions(version: string) {
  pkgPath = resolve(process.cwd(), "package.json");
  pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

main().catch((err) => {
  updateVersions(currentVersion);
  logger.error("\n", err);
  process.exit(1);
});
