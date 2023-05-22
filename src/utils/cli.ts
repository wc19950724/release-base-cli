import fs from "node:fs";
import path from "node:path";

import arg from "arg";
import c from "picocolors";

import { Options } from "@/types";
import { logger, optionsDefault } from "@/utils";

export const spec: arg.Spec = {
  "--help": Boolean,
  "--version": Boolean,
  "--preid": String,
  "--commit": String,
  "--quiet": Boolean,
  "-h": "--help",
  "-v": "--version",
  "-p": "--preid",
  "-c": "--commit",
  "-q": "--quiet",
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
  for (const [key, value] of transformedSpec) {
    logger.warn(`\t${key}: ${c.bold(argsTips(value))}`);
  }
};

export const versionHandler = () => {
  const pkgPath = path.resolve(path.dirname(__dirname), "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  logger.success(c.bold(pkg.version));
};
