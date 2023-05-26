import { cac } from "cac";

import { version as pkgVersion } from "@/../package.json";
import main from "@/index";
import { logger, optionsDefault } from "@/utils";

const cli = async () => {
  const program = cac("release-cli");
  program
    .command("")
    .option("-p, --preid", "version prefix", {
      default: optionsDefault.preid,
    })
    .option("-c, --commit", "commit message", {
      default: optionsDefault.commit,
    })
    .option("-q, --quiet", "quiet release", {
      default: optionsDefault.quiet,
    })
    .option("-t, --test", "test release", {
      default: optionsDefault.test,
    })
    .example(
      `release-cli -p ${optionsDefault.preid} -c '${optionsDefault.commit}' -q `
    )
    .action(async (options) => {
      await main(options)
        .catch((err: Error) => {
          logger.error(`${err.name}: ${err.message}`);
        })
        .finally(() => {
          process.exit(0);
        });
    });
  program.help();
  program.version(pkgVersion);
  program.parse(process.argv);
};

cli().catch((err) => {
  if (err instanceof Error) {
    logger.error(`${err.name}: ${err.message}`);
  } else {
    logger.log(err);
  }
});
