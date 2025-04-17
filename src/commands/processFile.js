import fs from "fs/promises";
import path from "path";
import clipboard from "clipboardy";
import * as Terser from "terser";
import { transformCode } from "../lib/transformCode.js";
import { removeConsolesPrecise } from "../lib/removeConsoles.js";
import {
  logError,
  logFileProcessed,
  logFileModified,
  logFileUnchanged,
} from "../utils/logger.js";

export async function handleProcessFile(argv) {
  const filePath = argv.filepath;
  const useMinify = argv.minify;
  const removeConsolesFlag = argv.c;

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
      logError(`The filepath provided must be a file, not a directory.`);
      if (!removeConsolesFlag) {
        console.error(`       Did you mean to use the 'tree' command?`);
      }
      process.exit(1);
    }

    if (removeConsolesFlag) {
      // --- Action: Remove Consoles In-Place (Precise - TS API) ---
      if (useMinify) {
        logError(
          "The -m (minify) flag cannot be used with -c (remove-consoles). Use one or the other."
        );
        process.exit(1);
      }

      const ext = path.extname(filePath).toLowerCase();
      const allowedExts = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];
      if (!allowedExts.includes(ext)) {
        logError(
          `--remove-consoles flag is only supported for JavaScript/TypeScript files (found ${ext}).`
        );
        process.exit(1);
      }

      const fileContent = await fs.readFile(filePath, "utf8");
      const originalChars = fileContent.length;

      // Use the TS API based precise function
      const processedCode = await removeConsolesPrecise(fileContent, filePath);

      if (processedCode === fileContent) {
        logFileUnchanged(filePath);
      } else {
        await fs.writeFile(filePath, processedCode, "utf8");
        const processedChars = processedCode.length;
        logFileModified(filePath, originalChars, processedChars);
      }
    } else {
      // --- Default Action: Process (Minify if -m) and Copy to Clipboard ---
      const fileContent = await fs.readFile(filePath, "utf8");
      const originalLines = fileContent.split("\n").length;
      const originalChars = fileContent.length;

      const processedCode = await transformCode(fileContent, useMinify); // Uses Terser
      const processedChars = processedCode.length;

      await clipboard.write(processedCode);
      logFileProcessed(originalChars, originalLines, processedChars);
    }
  } catch (error) {
    // --- Revised Error Handling ---
    const baseName = path.basename(filePath || "input");

    if (error.code === "ENOENT") {
      logError(`File not found: ${filePath}`);
    }
    // Only check for Terser error if we were NOT in remove-consoles mode
    else if (!removeConsolesFlag && error instanceof Terser.TSError) {
      logError(
        `JS Minification Error in ${baseName}: ${error.message} (line: ${error.line}, col: ${error.col})`
      );
    }
    // Check if it's the generic error re-thrown from our precise removal function
    else if (
      removeConsolesFlag &&
      error.message?.includes("Console removal failed")
    ) {
      // Specific error was already logged inside removeConsolesPrecise
      logError(
        `Console removal operation failed for ${baseName}. See details above.`
      );
    }
    // Generic fallback
    else {
      logError(
        `An unexpected error occurred processing ${baseName}: ${
          error.message || error
        }`
      );
    }
    process.exit(1); // Exit after logging
  }
}
