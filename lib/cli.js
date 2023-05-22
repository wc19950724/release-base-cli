"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli.ts
var import_arg = __toESM(require("arg"));

// src/index.ts
var import_node_fs4 = __toESM(require("fs"));
var import_node_path4 = __toESM(require("path"));

// src/utils/answers.ts
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
var import_inquirer = __toESM(require("inquirer"));
var semver = __toESM(require("semver"));
var prompts = import_inquirer.default.createPromptModule();
var createInc = (preid) => {
  const pkgPath = import_node_path.default.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(import_node_fs.default.readFileSync(pkgPath, "utf-8"));
  const currentVersion = pkg.version;
  return (i) => semver.inc(currentVersion, i, preid || optionsDefault.preid) || currentVersion;
};
var getIncVersion = () => {
  const { preid } = getOptions();
  const versionMap = {};
  const inc2 = createInc(preid);
  const versionIncrements = [
    "major",
    "minor",
    "patch",
    "premajor",
    "preminor",
    "prepatch",
    "prerelease"
  ];
  for (const type of versionIncrements) {
    versionMap[type] = inc2(type);
  }
  return versionMap;
};
var selectReleaseType = async (currentVersion) => {
  const incVersion = getIncVersion();
  const answers = await prompts([
    {
      type: "list",
      name: "release",
      message: "\nSelect release type",
      default: "patch",
      pageSize: 10,
      choices: [
        ...Object.keys(incVersion).map((i) => ({
          value: i,
          name: `${i} (${incVersion[i]})`
        })),
        {
          value: "custom",
          name: "custom"
        }
      ]
    },
    {
      type: "input",
      name: "custom",
      message: "Enter the new version number:",
      default: currentVersion,
      when: (previousAnswer) => previousAnswer.release === "custom",
      validate: (custom) => {
        return semver.valid(custom) ? true : "That's not a valid version number";
      }
    }
  ]);
  if (answers.release === "custom") {
    return answers.custom;
  }
  return incVersion[answers.release];
};
var confirmReleasing = async (targetVersion) => {
  const { quiet } = getOptions();
  if (quiet)
    return true;
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Releasing v${targetVersion}. Confirm?`
  });
  return yes;
};
var confirmPublishGit = async () => {
  const { quiet } = getOptions();
  if (quiet)
    return true;
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Publish to Git?`
  });
  return yes;
};
var confirmGenerateTag = async (targetVersion) => {
  const { quiet } = getOptions();
  if (quiet)
    return true;
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Generate & Publish Tag: v${targetVersion}?`
  });
  return yes;
};
var cmdPrompt = async (cmds) => {
  const { result } = await prompts({
    type: "list",
    name: "result",
    message: "Select cmd type",
    choices: cmds
  });
  return result;
};

// src/utils/cli.ts
var import_node_fs2 = __toESM(require("fs"));
var import_node_path2 = __toESM(require("path"));
var import_picocolors = __toESM(require("picocolors"));
var spec = {
  "--help": Boolean,
  "--version": Boolean,
  "--preid": String,
  "--commit": String,
  "--quiet": Boolean,
  "-h": "--help",
  "-v": "--version",
  "-p": "--preid",
  "-c": "--commit",
  "-q": "--quiet"
};
var formatArgs = (args) => {
  const options2 = {};
  for (const key in args) {
    const value = args[key];
    switch (key) {
      case "--preid":
        options2.preid = value;
        break;
      case "--commit":
        options2.commit = value;
        break;
      case "--quiet":
        options2.quiet = value;
        break;
      default:
        break;
    }
  }
  return options2;
};
var argsTips = (key) => {
  let tip = "";
  switch (key) {
    case "-h":
      tip = " ".repeat(3) + "cli help";
      break;
    case "-v":
      tip = " ".repeat(0) + "package version";
      break;
    case "-p":
      tip = " ".repeat(2) + `version prefix default '${optionsDefault.preid}'`;
      break;
    case "-c":
      tip = " ".repeat(1) + `commit message default '${optionsDefault.commit}'`;
      break;
    case "-q":
      tip = " ".repeat(2) + `quiet release default ${optionsDefault.quiet}`;
      break;
    default:
      break;
  }
  return tip;
};
var helpHandler = () => {
  const transformedSpec = /* @__PURE__ */ new Map();
  for (const key in spec) {
    const value = spec[key];
    const existingValue = spec[value];
    if (existingValue) {
      transformedSpec.set(`${key}, ${value}`, key);
      transformedSpec.delete(key);
      transformedSpec.delete(`${value}`);
    } else {
      transformedSpec.set(key, key);
    }
  }
  for (const [key, value] of transformedSpec) {
    logger_exports.warn(`	${key}: ${import_picocolors.default.bold(argsTips(value))}`);
  }
};
var versionHandler = () => {
  const pkgPath = import_node_path2.default.resolve(import_node_path2.default.dirname(__dirname), "..", "package.json");
  const pkg = JSON.parse(import_node_fs2.default.readFileSync(pkgPath, "utf-8"));
  logger_exports.success(import_picocolors.default.bold(pkg.version));
};

// src/utils/common.ts
var optionsDefault = {
  preid: "beta",
  commit: "release: v",
  quiet: false
};
var options = optionsDefault;
var setOptions = async (params) => {
  Object.assign(options, params);
};
var getOptions = () => options;

// src/utils/logger.ts
var logger_exports = {};
__export(logger_exports, {
  default: () => logger_default,
  error: () => error,
  gray: () => gray,
  info: () => info,
  log: () => log,
  success: () => success,
  warn: () => warn
});
var import_picocolors2 = __toESM(require("picocolors"));
var error = (msg) => {
  console.log(import_picocolors2.default.red(msg));
};
var warn = (msg) => {
  console.log(import_picocolors2.default.yellow(msg));
};
var info = (msg) => {
  console.log(import_picocolors2.default.blue(msg));
};
var success = (msg) => {
  console.log(import_picocolors2.default.green(msg));
};
var log = (msg) => {
  console.log(msg);
};
var gray = (msg) => {
  console.log(import_picocolors2.default.gray(msg));
};
var logger_default = {
  error,
  warn,
  info,
  success,
  log,
  gray
};

// src/utils/utils.ts
var import_node_fs3 = __toESM(require("fs"));
var import_node_path3 = __toESM(require("path"));
var import_execa = require("execa");
var run = async (bin, args, opts = {}) => {
  try {
    const { quiet } = getOptions();
    return await (0, import_execa.execa)(bin, args, {
      stdio: quiet ? "ignore" : "inherit",
      ...opts
    });
  } catch (error2) {
    return Promise.reject(error2);
  }
};
var getCmds = async () => {
  const cmds = [];
  if (import_node_fs3.default.existsSync("package-lock.json")) {
    cmds.push("npm");
  } else if (import_node_fs3.default.existsSync("yarn.lock")) {
    cmds.push("yarn");
  } else if (import_node_fs3.default.existsSync("pnpm-lock.yaml")) {
    cmds.push("pnpm");
  }
  return cmds;
};
var selectCmd = async () => {
  let command = "npm";
  const cmds = await getCmds();
  if (cmds.length === 1) {
    command = cmds[0];
  } else if (cmds.length > 1) {
    const result = await cmdPrompt(cmds);
    command = result;
  }
  return command;
};
var step = (msg) => logger_exports.success(`
${msg}`);

// src/index.ts
var steps = async () => {
  const targetVersion = await selectVersion();
  if (!targetVersion)
    return;
  await updateVersions(targetVersion);
  await reBuild();
  await pushGit(targetVersion);
};
var selectVersion = async () => {
  const pkgPath = import_node_path4.default.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(import_node_fs4.default.readFileSync(pkgPath, "utf-8"));
  const currentVersion = pkg.version;
  const targetVersion = await selectReleaseType(currentVersion);
  const confirmRelease = await confirmReleasing(targetVersion);
  return confirmRelease && targetVersion;
};
var updateVersions = async (version) => {
  step("Updating package versions...");
  const pkgPath = import_node_path4.default.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(import_node_fs4.default.readFileSync(pkgPath, "utf-8"));
  pkg.version = version;
  import_node_fs4.default.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  logger_exports.log(`Package version updated: ${version}`);
};
var reBuild = async () => {
  step("Updating lockfile...");
  const cmd = await selectCmd();
  try {
    await run(cmd, ["install", "--prefer-offline"]);
  } catch (error2) {
    await run(cmd, ["install"]);
  }
  step("Rebuilding...");
  await run(cmd, ["build"]);
};
var pushGit = async (targetVersion) => {
  const { commit } = getOptions();
  step("Pushing to GitHub...");
  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    step("Committing changes...");
    await run("git", ["add", "-A"]);
    await run("git", ["commit", "-m", `${commit}${targetVersion}`]);
  }
  const publishOk = await confirmPublishGit();
  if (publishOk) {
    await run("git", ["push"]);
    step("Generate & Publish Tag...");
    const tagOk = await confirmGenerateTag(targetVersion);
    if (tagOk) {
      try {
        await run("git", ["tag", `v${targetVersion}`]);
      } catch (error2) {
        logger_exports.error(error2.stack);
      }
      await run("git", ["push", "origin", `refs/tags/v${targetVersion}`]);
    }
  }
};
var main = async (params) => {
  await setOptions(params);
  await steps();
};
var src_default = main;

// src/cli.ts
var cli = async () => {
  const args = (0, import_arg.default)(spec, {
    permissive: true
  });
  if (args["--help"]) {
    helpHandler();
  } else if (args["--version"]) {
    versionHandler();
  } else {
    const options2 = formatArgs(args);
    await src_default(options2);
  }
};
cli().catch((err) => {
  logger_exports.error(`${err.name}: ${err.message}`);
}).finally(() => {
  process.exit(0);
});
