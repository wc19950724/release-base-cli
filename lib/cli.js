"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// node_modules/.pnpm/arg@5.0.2/node_modules/arg/index.js
var require_arg = __commonJS({
  "node_modules/.pnpm/arg@5.0.2/node_modules/arg/index.js"(exports, module2) {
    var flagSymbol = Symbol("arg flag");
    var ArgError = class extends Error {
      constructor(msg, code) {
        super(msg);
        this.name = "ArgError";
        this.code = code;
        Object.setPrototypeOf(this, ArgError.prototype);
      }
    };
    function arg2(opts, {
      argv = process.argv.slice(2),
      permissive = false,
      stopAtPositional = false
    } = {}) {
      if (!opts) {
        throw new ArgError(
          "argument specification object is required",
          "ARG_CONFIG_NO_SPEC"
        );
      }
      const result = { _: [] };
      const aliases = {};
      const handlers = {};
      for (const key of Object.keys(opts)) {
        if (!key) {
          throw new ArgError(
            "argument key cannot be an empty string",
            "ARG_CONFIG_EMPTY_KEY"
          );
        }
        if (key[0] !== "-") {
          throw new ArgError(
            `argument key must start with '-' but found: '${key}'`,
            "ARG_CONFIG_NONOPT_KEY"
          );
        }
        if (key.length === 1) {
          throw new ArgError(
            `argument key must have a name; singular '-' keys are not allowed: ${key}`,
            "ARG_CONFIG_NONAME_KEY"
          );
        }
        if (typeof opts[key] === "string") {
          aliases[key] = opts[key];
          continue;
        }
        let type = opts[key];
        let isFlag = false;
        if (Array.isArray(type) && type.length === 1 && typeof type[0] === "function") {
          const [fn] = type;
          type = (value, name, prev = []) => {
            prev.push(fn(value, name, prev[prev.length - 1]));
            return prev;
          };
          isFlag = fn === Boolean || fn[flagSymbol] === true;
        } else if (typeof type === "function") {
          isFlag = type === Boolean || type[flagSymbol] === true;
        } else {
          throw new ArgError(
            `type missing or not a function or valid array type: ${key}`,
            "ARG_CONFIG_VAD_TYPE"
          );
        }
        if (key[1] !== "-" && key.length > 2) {
          throw new ArgError(
            `short argument keys (with a single hyphen) must have only one character: ${key}`,
            "ARG_CONFIG_SHORTOPT_TOOLONG"
          );
        }
        handlers[key] = [type, isFlag];
      }
      for (let i = 0, len = argv.length; i < len; i++) {
        const wholeArg = argv[i];
        if (stopAtPositional && result._.length > 0) {
          result._ = result._.concat(argv.slice(i));
          break;
        }
        if (wholeArg === "--") {
          result._ = result._.concat(argv.slice(i + 1));
          break;
        }
        if (wholeArg.length > 1 && wholeArg[0] === "-") {
          const separatedArguments = wholeArg[1] === "-" || wholeArg.length === 2 ? [wholeArg] : wholeArg.slice(1).split("").map((a) => `-${a}`);
          for (let j = 0; j < separatedArguments.length; j++) {
            const arg3 = separatedArguments[j];
            const [originalArgName, argStr] = arg3[1] === "-" ? arg3.split(/=(.*)/, 2) : [arg3, void 0];
            let argName = originalArgName;
            while (argName in aliases) {
              argName = aliases[argName];
            }
            if (!(argName in handlers)) {
              if (permissive) {
                result._.push(arg3);
                continue;
              } else {
                throw new ArgError(
                  `unknown or unexpected option: ${originalArgName}`,
                  "ARG_UNKNOWN_OPTION"
                );
              }
            }
            const [type, isFlag] = handlers[argName];
            if (!isFlag && j + 1 < separatedArguments.length) {
              throw new ArgError(
                `option requires argument (but was followed by another short argument): ${originalArgName}`,
                "ARG_MISSING_REQUIRED_SHORTARG"
              );
            }
            if (isFlag) {
              result[argName] = type(true, argName, result[argName]);
            } else if (argStr === void 0) {
              if (argv.length < i + 2 || argv[i + 1].length > 1 && argv[i + 1][0] === "-" && !(argv[i + 1].match(/^-?\d*(\.(?=\d))?\d*$/) && (type === Number || // eslint-disable-next-line no-undef
              typeof BigInt !== "undefined" && type === BigInt))) {
                const extended = originalArgName === argName ? "" : ` (alias for ${argName})`;
                throw new ArgError(
                  `option requires argument: ${originalArgName}${extended}`,
                  "ARG_MISSING_REQUIRED_LONGARG"
                );
              }
              result[argName] = type(argv[i + 1], argName, result[argName]);
              ++i;
            } else {
              result[argName] = type(argStr, argName, result[argName]);
            }
          }
        } else {
          result._.push(wholeArg);
        }
      }
      return result;
    }
    arg2.flag = (fn) => {
      fn[flagSymbol] = true;
      return fn;
    };
    arg2.COUNT = arg2.flag((v, name, existingCount) => (existingCount || 0) + 1);
    arg2.ArgError = ArgError;
    module2.exports = arg2;
  }
});

// node_modules/.pnpm/picocolors@1.0.0/node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "node_modules/.pnpm/picocolors@1.0.0/node_modules/picocolors/picocolors.js"(exports, module2) {
    var tty = require("tty");
    var isColorSupported = !("NO_COLOR" in process.env || process.argv.includes("--no-color")) && ("FORCE_COLOR" in process.env || process.argv.includes("--color") || process.platform === "win32" || tty.isatty(1) && process.env.TERM !== "dumb" || "CI" in process.env);
    var formatter = (open, close, replace = open) => (input) => {
      let string = "" + input;
      let index = string.indexOf(close, open.length);
      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
    var replaceClose = (string, close, replace, index) => {
      let start = string.substring(0, index) + replace;
      let end = string.substring(index + close.length);
      let nextIndex = end.indexOf(close);
      return ~nextIndex ? start + replaceClose(end, close, replace, nextIndex) : start + end;
    };
    var createColors = (enabled = isColorSupported) => ({
      isColorSupported: enabled,
      reset: enabled ? (s) => `\x1B[0m${s}\x1B[0m` : String,
      bold: enabled ? formatter("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m") : String,
      dim: enabled ? formatter("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m") : String,
      italic: enabled ? formatter("\x1B[3m", "\x1B[23m") : String,
      underline: enabled ? formatter("\x1B[4m", "\x1B[24m") : String,
      inverse: enabled ? formatter("\x1B[7m", "\x1B[27m") : String,
      hidden: enabled ? formatter("\x1B[8m", "\x1B[28m") : String,
      strikethrough: enabled ? formatter("\x1B[9m", "\x1B[29m") : String,
      black: enabled ? formatter("\x1B[30m", "\x1B[39m") : String,
      red: enabled ? formatter("\x1B[31m", "\x1B[39m") : String,
      green: enabled ? formatter("\x1B[32m", "\x1B[39m") : String,
      yellow: enabled ? formatter("\x1B[33m", "\x1B[39m") : String,
      blue: enabled ? formatter("\x1B[34m", "\x1B[39m") : String,
      magenta: enabled ? formatter("\x1B[35m", "\x1B[39m") : String,
      cyan: enabled ? formatter("\x1B[36m", "\x1B[39m") : String,
      white: enabled ? formatter("\x1B[37m", "\x1B[39m") : String,
      gray: enabled ? formatter("\x1B[90m", "\x1B[39m") : String,
      bgBlack: enabled ? formatter("\x1B[40m", "\x1B[49m") : String,
      bgRed: enabled ? formatter("\x1B[41m", "\x1B[49m") : String,
      bgGreen: enabled ? formatter("\x1B[42m", "\x1B[49m") : String,
      bgYellow: enabled ? formatter("\x1B[43m", "\x1B[49m") : String,
      bgBlue: enabled ? formatter("\x1B[44m", "\x1B[49m") : String,
      bgMagenta: enabled ? formatter("\x1B[45m", "\x1B[49m") : String,
      bgCyan: enabled ? formatter("\x1B[46m", "\x1B[49m") : String,
      bgWhite: enabled ? formatter("\x1B[47m", "\x1B[49m") : String
    });
    module2.exports = createColors();
    module2.exports.createColors = createColors;
  }
});

// src/cli.ts
var import_arg = __toESM(require_arg());

// src/index.ts
var import_node_fs4 = __toESM(require("fs"));
var import_node_path4 = __toESM(require("path"));

// src/utils/answers.ts
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
var import_prompts = __toESM(require("prompts"));
var semver = __toESM(require("semver"));
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
  const answers = await (0, import_prompts.default)([
    {
      type: "autocomplete",
      name: "release",
      message: "\nSelect release type",
      initial: "patch",
      choices: [
        ...Object.keys(incVersion).map((i) => ({
          value: i,
          title: `${i.padStart(10, " ")} (${incVersion[i]})`
        })),
        {
          value: "custom",
          title: "custom"
        }
      ]
    },
    {
      type: (prev) => prev === "custom" ? "text" : null,
      name: "custom",
      message: "Enter the new version number:",
      initial: currentVersion,
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
  const { yes } = await (0, import_prompts.default)({
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
  const { yes } = await (0, import_prompts.default)({
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
  const { yes } = await (0, import_prompts.default)({
    type: "confirm",
    name: "yes",
    message: `Generate & Publish Tag: v${targetVersion}?`
  });
  return yes;
};
var cmdPrompt = async (cmds) => {
  const { result } = await (0, import_prompts.default)({
    type: "list",
    name: "result",
    message: "Select cmd type",
    choices: cmds.map((cmd) => ({
      value: cmd,
      title: cmd
    }))
  });
  return result;
};

// src/utils/cli.ts
var import_node_fs2 = __toESM(require("fs"));
var import_node_path2 = __toESM(require("path"));
var import_picocolors = __toESM(require_picocolors());
var spec = {
  "--help": Boolean,
  "--version": Boolean,
  "--preid": String,
  "--commit": String,
  "--quiet": Boolean,
  "--test": Boolean,
  "-h": "--help",
  "-v": "--version",
  "-p": "--preid",
  "-c": "--commit",
  "-q": "--quiet",
  "-t": "--test"
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
      case "--test":
        options2.test = value;
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
      tip = "cli help";
      break;
    case "-v":
      tip = "package version";
      break;
    case "-p":
      tip = "version prefix".padEnd(PADDING) + `default '${optionsDefault.preid}'`;
      break;
    case "-c":
      tip = "commit message".padEnd(PADDING) + `default '${optionsDefault.commit}'`;
      break;
    case "-q":
      tip = "quiet release".padEnd(PADDING) + `default ${optionsDefault.quiet}`;
      break;
    case "-t":
      tip = "test release".padEnd(PADDING) + `default ${optionsDefault.quiet}`;
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
  const formatText = createFormat(Object.fromEntries(transformedSpec));
  for (const [key, value] of transformedSpec) {
    logger_exports.warn(`${formatText(key)}: ${import_picocolors.default.bold(argsTips(value))}`);
  }
  logger_exports.log("\n");
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
  quiet: false,
  test: false
};
var options = optionsDefault;
var setOptions = async (params) => {
  Object.assign(options, params);
};
var getOptions = () => options;
var PADDING = 16;

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
var import_picocolors2 = __toESM(require_picocolors());
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
var import_node_child_process = require("child_process");
var import_node_fs3 = __toESM(require("fs"));
var import_node_path3 = __toESM(require("path"));
var run = async (bin, args) => {
  const { test, quiet } = getOptions();
  if (test) {
    logger_exports.warn(`[test run] ${bin} ${args.join(" ")}`);
    return;
  }
  try {
    const stdout = (0, import_node_child_process.execSync)(`${bin} ${args.join(" ")}`);
    !quiet && console.log(`stdout: ${stdout}`);
    return stdout;
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
var createFormat = (msgObj) => {
  const maxLength = Object.keys(msgObj).reduce((maxLength2, key) => {
    return key.length > maxLength2 ? key.length : maxLength2;
  }, 0);
  return (key, fillString = " ") => key.padEnd(maxLength, fillString);
};

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
  const stdout = await run("git", ["diff"]);
  if (stdout) {
    step("Committing changes...");
    await run("git", ["add", "-A"]);
    await run("git", ["commit", "-m", `"${commit}${targetVersion}"`]);
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
