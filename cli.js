#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs/promises";
import path from "path";
import clipboard from "clipboardy";
import * as Terser from "terser";

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
    throw error;
  }
}

async function displayTree(dirPath, outputLines, prefix = "", isRoot = true) {
  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    outputLines.push(
      `${prefix}└── [Error reading directory: ${error.code || error.message}]`
    );
    return;
  }
  const filteredEntries = entries.filter(
    (entry) =>
      entry.name !== "node_modules" &&
      entry.name !== ".git" &&
      entry.name !== ".DS_Store"
  );
  if (isRoot && outputLines.length === 0) {
    outputLines.push(path.basename(dirPath));
  }
  filteredEntries.sort((a, b) => a.name.localeCompare(b.name));
  for (let i = 0; i < filteredEntries.length; i++) {
    const entry = filteredEntries[i];
    const isLast = i === filteredEntries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const entryPath = path.join(dirPath, entry.name);
    outputLines.push(`${prefix}${connector}${entry.name}`);
    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      await displayTree(entryPath, outputLines, newPrefix, false);
    }
  }
}

async function main() {
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
        const filePath = argv.filepath;
        const useMinify = argv.minify;
        try {
          let stats;
          try {
            stats = await fs.stat(filePath);
          } catch (e) {
            if (e.code === "ENOENT") {
              console.error(`Error: File not found at path: ${filePath}`);
              process.exit(1);
            }
            throw e;
          }
          if (stats.isDirectory()) {
            console.error(
              `Error: Default command requires a file path, but received a directory.`
            );
            console.error(`       Did you mean to use the 'tree' command?`);
            process.exit(1);
          }
          const fileContent = await fs.readFile(filePath, "utf8");
          const originalLines = fileContent.split("\n").length;
          const originalChars = fileContent.length;
          const processedCode = await transformCode(fileContent, useMinify);
          const processedLines = processedCode.split("\n").length;
          const processedChars = processedCode.length;
          await clipboard.write(processedCode);
          const percentageGain = (
            ((originalChars - processedChars) / originalChars) *
            100
          ).toFixed(2);
          console.log(`\n————————————————————————————————————————————`);
          console.log("✅ Processed code copied to clipboard!\n");
          console.log(
            `— Before : ${originalChars} characters (${originalLines} lines)`
          );
          console.log(
            `— After  : ${processedChars} characters (${percentageGain}% reduction)`
          );
          console.log("\nThanks for using CodeSqueezer!");
          console.log("Context window, here we come! 🔥");
          console.log(`————————————————————————————————————————————\n`);
        } catch (error) {
          if (error.code === "ENOENT") {
            console.error(`Error: File not found at path: ${filePath}`);
          } else if (error instanceof Terser.TSError) {
            console.error(
              `JavaScript Parsing/Minification Error: ${error.message} (line: ${error.line}, col: ${error.col})`
            );
          } else {
            console.error(
              "An unexpected error occurred during processing:",
              error.message || error
            );
          }
          process.exit(1);
        }
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
        const dirPath = argv.dirpath;
        const absolutePath = path.resolve(dirPath);
        console.log(`Generating tree for: ${absolutePath}...`);
        try {
          const stats = await fs.stat(dirPath);
          if (!stats.isDirectory()) {
            console.error(
              `Error: Provided path is not a directory: ${absolutePath}`
            );
            process.exit(1);
          }
          const treeLines = [];
          await displayTree(dirPath, treeLines);
          const treeString = treeLines.join("\n");
          await clipboard.write(treeString);
          console.log(`\n————————————————————————————————————————————`);
          console.log("✅ Directory tree copied to clipboard!");
          console.log(`   (${treeLines.length} lines copied)`);
          console.log("\nThanks for using CodeSqueezer!");
          console.log(`————————————————————————————————————————————\n`);
        } catch (error) {
          if (error.code === "ENOENT") {
            console.error(
              `Error: Directory not found at path: ${absolutePath}`
            );
          } else {
            console.error(
              "An unexpected error occurred running tree:",
              error.message || error
            );
          }
          process.exit(1);
        }
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

main();
