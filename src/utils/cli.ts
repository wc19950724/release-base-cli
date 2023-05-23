import fs from "node:fs";
import path from "node:path";

import arg from "arg";
import c from "picocolors";

import { Options } from "@/types";
import { createFormat, logger, optionsDefault, PADDING } from "@/utils";

export const spec: arg.Spec = {
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
  "-t": "--test",
};

export const formatArgs = (args: arg.Result<typeof spec>): Options => {
  const options: Options = {};
  for (const key in args) {
    const value = args[key];
    switch (key) {
      case "--preid":
        options.preid = value;
        break;
      case "--commit":
        options.commit = value;
        break;
      case "--quiet":
        options.quiet = value;
        break;
      case "--test":
        options.test = value;
        break;
      default:
        break;
    }
  }

  return options;
};

export const argsTips = (key: string) => {
  let tip = "";
  switch (key) {
    case "-h":
      tip = "cli help";
      break;
    case "-v":
      tip = "package version";
      break;
    case "-p":
      tip =
        "version prefix".padEnd(PADDING) + `default '${optionsDefault.preid}'`;
      break;
    case "-c":
      tip =
        "commit message".padEnd(PADDING) + `default '${optionsDefault.commit}'`;
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

export const helpHandler = () => {
  const transformedSpec = new Map<string, string>();
  for (const key in spec) {
    const value = spec[key as keyof typeof spec];
    const existingValue = spec[value as keyof typeof spec];
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
    logger.warn(`${formatText(key)}: ${c.bold(argsTips(value))}`);
  }
  logger.log("\n");
};

export const versionHandler = () => {
  const pkgPath = path.resolve(path.dirname(__dirname), "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  logger.success(c.bold(pkg.version));
};
