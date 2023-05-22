import c from "picocolors";

export const error = (msg?: string) => {
  console.log(c.red(msg));
};

export const warn = (msg?: string) => {
  console.log(c.yellow(msg));
};

export const info = (msg?: string) => {
  console.log(c.blue(msg));
};

export const success = (msg?: string) => {
  console.log(c.green(msg));
};

export const log = (msg?: string) => {
  console.log(msg);
};

export const gray = (msg?: string) => {
  console.log(c.gray(msg));
};

export default {
  error,
  warn,
  info,
  success,
  log,
  gray,
};
