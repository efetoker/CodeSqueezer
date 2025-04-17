import fs from "fs/promises";
import path from "path";
import clipboard from "clipboardy";
import * as Terser from "terser";
import { transformCode } from "../lib/transformCode.js";
import { logError, logFileProcessed } from "../utils/logger.js";

export async function handleProcessFile(argv) {
  const filePath = argv.filepath;
  const useMinify = argv.minify;
  try {
    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (e) {
      if (e.code === "ENOENT") {
        logError(`File not found at path: ${filePath}`);
        process.exit(1);
      }
      throw e;
    }
    if (stats.isDirectory()) {
      logError(
        `Default command requires a file path, but received a directory.`
      );
      console.error(`       Did you mean to use the 'tree' command?`); // Keep specific suggestion separate
      process.exit(1);
    }

    const fileContent = await fs.readFile(filePath, "utf8");
    const originalLines = fileContent.split("\n").length;
    const originalChars = fileContent.length;

    const processedCode = await transformCode(fileContent, useMinify);
    const processedChars = processedCode.length; // Calculate processed chars

    await clipboard.write(processedCode);

    logFileProcessed(originalChars, originalLines, processedChars);
  } catch (error) {
    if (error.code === "ENOENT") {
      // Should be caught by stat, but keep as fallback
      logError(`File not found at path: ${filePath}`);
    } else if (error instanceof Terser.TSError) {
      logError(
        `JavaScript Parsing/Minification Error: ${error.message} (line: ${error.line}, col: ${error.col})`
      );
    } else {
      logError(
        `An unexpected error occurred during processing: ${
          error.message || error
        }`
      );
    }
    process.exit(1);
  }
}
