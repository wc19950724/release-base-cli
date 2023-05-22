import fs from "node:fs";
import path from "node:path";

import { build } from "tsup";

import { step } from "./utils";

const buildConfig = {
  entry: ["src/cli.ts"],
  outDir: "lib",
  format: "cjs",
  clean: true,
  minify: true,
};

const rootPath = path.dirname(__dirname);

const main = async () => {
  await build(buildConfig);
  console.log("\n");
  formatPkgJson();
  copyFiles(["LICENSE", "README.md"]);
  step(buildConfig.outDir, "SIZE");
};

const formatPkgJson = () => {
  const pkgPath = path.resolve(rootPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  const attrs = [
    "name",
    "version",
    "description",
    "bin",
    "keywords",
    "author",
    "license",
    "repository",
    "bugs",
    "homepage",
  ];

  const npmPkg: {
    [k: string]: unknown;
  } = {};

  attrs.forEach((key) => {
    npmPkg[key] = pkg[key] || "";
  });

  fs.writeFileSync(
    path.resolve(rootPath, buildConfig.outDir, "package.json"),
    JSON.stringify(npmPkg, null, 2),
    "utf-8"
  );
  step(`${buildConfig.outDir}/package.json`, "JSON");
};

const copyFiles = (filesPath: string[]) => {
  for (const filePath of filesPath) {
    const src = path.resolve(rootPath, filePath);
    const dest = `${buildConfig.outDir}/${path.basename(filePath)}`;
    fs.copyFileSync(src, dest);
    step(dest, "COPY");
  }
};

main();
