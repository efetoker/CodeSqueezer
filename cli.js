#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs/promises";
import clipboard from "clipboardy";
import * as Terser from "terser"; // Import Terser

async function transformCode(code, isMinifyEnabled) {
  try {
    const options = {
      compress: isMinifyEnabled ? {} : false,
      mangle: isMinifyEnabled ? true : false,
      format: {
        comments: false,
      },
      sourceMap: false,
    };

    const result = await Terser.minify(code, options);

    if (result.error) {
      throw result.error;
    }

    return result.code;
  } catch (error) {
    console.error("Error during code transformation:", error);
    throw new Error(`Transformation failed: ${error.message}`);
  }
}

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 <filepath> [options]")
  .command("$0 <filepath>", "Process code file for AI context", (yargs) => {
    yargs.positional("filepath", {
      describe: "Path to the code file to process",
      type: "string",
    });
  })
  .option("m", {
    alias: "minify",
    type: "boolean",
    description: "Apply full minification (renaming variables, etc.)",
    default: false,
  })
  .demandCommand(1, "You must provide the path to the file.")
  .help("h")
  .alias("h", "help")
  .alias("v", "version")
  .strict()
  .parse();

async function main() {
  const filePath = argv.filepath;
  const useMinify = argv.minify;

  try {
    console.log(`Reading file: ${filePath}...`);
    const fileContent = await fs.readFile(filePath, "utf8");

    console.log(
      `Processing code ${
        useMinify ? "with full minification" : "for safe flattening"
      }...`
    );
    const processedCode = await transformCode(fileContent, useMinify);

    await clipboard.write(processedCode);
    console.log("✅ Processed code copied to clipboard!");
    console.log(`🔢 (${processedCode.length} characters)`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`Error: File not found at path: ${filePath}`);
    } else if (error.name === "YError") {
      console.error(`Argument Error: ${error.message}`);
    } else if (error instanceof Terser.TSError) {
      console.error(
        `JavaScript Parsing/Minification Error: ${error.message} (line: ${error.line}, col: ${error.col})`
      );
    } else {
      console.error("An unexpected error occurred:", error);
    }
    process.exit(1);
  }
}

main();
