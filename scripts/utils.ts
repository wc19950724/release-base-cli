import fs from "node:fs";
import path from "node:path";

import c from "picocolors";

export const step = (filePath: string, type: string) => {
  filePath = filePath.replace(/\//, "\\");
  const file = path.resolve(path.dirname(__dirname), filePath);
  const totalSize = getFileSize(file);
  console.log(c.green(type), c.bold(filePath), c.green(prettyBytes(totalSize)));
};

export const prettyBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const unit = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const exp = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, exp)).toFixed(2)} ${unit[exp]}`;
};

export const getFileSize = (filePath: string) => {
  let totalSize = 0;

  // 递归遍历目录
  function traverseDirectory(currentPath: string) {
    const stats = fs.statSync(currentPath);
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);

      files.forEach((file) => {
        const _filePath = path.join(currentPath, file);
        const stats = fs.statSync(_filePath);

        if (stats.isFile()) {
          totalSize += stats.size;
        } else if (stats.isDirectory()) {
          traverseDirectory(_filePath); // 递归调用
        }
      });
    }
  }

  traverseDirectory(filePath);

  return totalSize;
};
