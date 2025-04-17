#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { handleProcessFile } from "./commands/processFile.js";
import { handleDisplayTree } from "./commands/displayTreeCmd.js";

async function run() {
  yargs(hideBin(process.argv))
    .command(
      "$0 <filepath>",
      false,
      (yargs) => {
        yargs
          .positional("filepath", {
            describe: "Path to the code file to process",
            type: "string",
            normalize: true,
          })
          .option("m", {
            alias: "minify",
            type: "boolean",
            description: "Apply full minification",
            default: false,
          });
      },
      async (argv) => {
        await handleProcessFile(argv);
      }
    )
    .command(
      "tree [dirpath]",
      false,
      (yargs) => {
        yargs.positional("dirpath", {
          describe:
            "Path to the directory to list (defaults to current directory)",
          type: "string",
          default: ".",
          normalize: true,
        });
      },
      async (argv) => {
        await handleDisplayTree(argv);
      }
    )
    .usage("Usage:\n  $0 <filepath> [-m]\n  $0 tree [dirpath]")
    .help("h")
    .alias("h", "help")
    .alias("v", "version")
    .strict()
    .wrap(process.stdout.columns)
    .parse();
}

run().catch((error) => {
  // Optional: Catch any completely unexpected errors during setup/run
  console.error("A critical error occurred in the CLI setup:", error);
  process.exit(1);
});
