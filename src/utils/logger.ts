import chalk from "chalk-cjs";

function error(...args: any[]) {
  console.log(chalk.redBright(args));
}

function warn(...args: any[]) {
  console.log(chalk.yellowBright(args));
}

function info(...args: any[]) {
  console.log(chalk.blueBright(args));
}

function success(...args: any[]) {
  console.log(chalk.greenBright(args));
}

export default {
  error,
  warn,
  info,
  success,
};
