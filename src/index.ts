import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { program } from "commander";
import { prompt } from "enquirer";
import { execa } from "execa";
import minimist from "minimist";
import { ReleaseType } from "semver";
import semverInc from "semver/functions/inc";
import prerelease from "semver/functions/prerelease";
import valid from "semver/functions/valid";

import logger from "./utils/logger";

program
  .option(
    "-c, --config <config>",
    "Specify the configuration file for conventional-changelog-cli"
  )
  .parse(process.argv);

const options = program.opts();

let pkgPath = resolve(process.cwd(), "package.json");
let pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const currentVersion = pkg.version;
const args = minimist(process.argv.slice(2));
const preId = args.preid || prerelease(currentVersion)?.[0];
const isDryRun = args.dry;

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
  logger.info(`[dryrun] ${bin} ${args.join(" ")}`, opts);
const runIfNotDry = isDryRun ? dryRun : run;
const step = (msg: string) => logger.success(msg);

async function main() {
  let targetVersion = args._[0];

  if (!targetVersion) {
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

  step("\nUpdating package versions...");
  updateVersions(targetVersion);

  // generate changelog
  step("\nGenerating changelog...");
  let configPath = "";
  if (options.config) {
    configPath = resolve(options.config);
    // 然后你就可以使用 configObject 对应的配置了
    logger.info(configPath, "configPath");
  }
  const changelogArgs = ["-p", "angular", "-i", "CHANGELOG.md"];
  if (configPath) {
    changelogArgs.push("-c", configPath);
  }
  await run(`conventional-changelog`, changelogArgs);

  const { yes: changelogOk } = await prompt<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Changelog generated. Does it look good?`,
  });

  if (!changelogOk) return;

  step("\nUpdating lockfile...");
  try {
    await run(`yarn`, ["install", "--prefer-offline"]);
  } catch (error) {
    await run(`yarn`, ["install"]);
  }
  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    step("\nCommitting changes...");
    await runIfNotDry("git", ["add", "-A"]);
    await runIfNotDry("git", ["commit", "-m", `release: v${targetVersion}`]);
  } else {
    console.log("No changes to commit.");
  }

  // push to GitHub
  step("\nPushing to GitHub...");
  const { yes: publishOk } = await prompt<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Publish to Git?`,
  });

  if (publishOk) {
    await runIfNotDry("git", ["config", "--global", "push.default", "current"]);
    await runIfNotDry("git", ["push"]);
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

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`);
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
  console.error(err);
  process.exit(1);
});
