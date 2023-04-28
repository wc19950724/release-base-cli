import chalk from "chalk-cjs";

function error(...args: any[]) {
  console.log(chalk.redBright(args.join("")));
}

function warn(...args: any[]) {
  console.log(chalk.yellowBright(args.join("")));
}

function info(...args: any[]) {
  console.log(chalk.blueBright(args.join("")));
}

function success(...args: any[]) {
  console.log(chalk.greenBright(args.join("")));
}

export default {
  error,
  warn,
  info,
  success,
};
