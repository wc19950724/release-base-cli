import arg from "arg";

import main from "@/index";
import { formatArgs, helpHandler, logger, spec, versionHandler } from "@/utils";

const cli = async () => {
  const args = arg(spec, {
    permissive: true,
  });

  if (args["--help"]) {
    helpHandler();
  } else if (args["--version"]) {
    versionHandler();
  } else {
    const options = formatArgs(args);

    await main(options);
  }
};

cli()
  .catch((err: Error) => {
    logger.error(`${err.name}: ${err.message}`);
  })
  .finally(() => {
    process.exit(0);
  });
