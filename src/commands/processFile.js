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
  logDirectoryProcessed,
} from "../utils/logger.js";

// Helper function to process a single file
async function processSingleFile(filePath, useMinify, removeConsolesFlag) {
  const fileContent = await fs.readFile(filePath, "utf8");
  const originalLines = fileContent.split("\n").length;
  const originalChars = fileContent.length;

  if (removeConsolesFlag) {
    const processedCode = await removeConsolesPrecise(fileContent, filePath);
    if (processedCode === fileContent) {
      logFileUnchanged(filePath);
    } else {
      await fs.writeFile(filePath, processedCode, "utf8");
      const processedChars = processedCode.length;
      logFileModified(filePath, originalChars, processedChars);
    }
  } else {
    const processedCode = await transformCode(fileContent, useMinify, filePath);
    const processedChars = processedCode.length;
    return {
      code: processedCode,
      originalChars,
      originalLines,
      processedChars,
    };
  }
  return null;
}

// Helper function to process a directory recursively
async function processDirectory(dirPath, useMinify, removeConsolesFlag) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  let allProcessedCode = [];
  let totalOriginalChars = 0;
  let totalOriginalLines = 0;
  let totalProcessedChars = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    // Skip node_modules, .git, and other common directories
    if (entry.isDirectory() && 
        (entry.name === 'node_modules' || 
         entry.name === '.git' || 
         entry.name === 'dist' || 
         entry.name === 'build')) {
      continue;
    }

    if (entry.isDirectory()) {
      const result = await processDirectory(fullPath, useMinify, removeConsolesFlag);
      if (result) {
        allProcessedCode.push(...result.processedCode);
        totalOriginalChars += result.totalOriginalChars;
        totalOriginalLines += result.totalOriginalLines;
        totalProcessedChars += result.totalProcessedChars;
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Only process JavaScript and TypeScript files
      if (['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(ext)) {
        const result = await processSingleFile(fullPath, useMinify, removeConsolesFlag);
        if (result) {
          allProcessedCode.push(result.code);
          totalOriginalChars += result.originalChars;
          totalOriginalLines += result.originalLines;
          totalProcessedChars += result.processedChars;
        }
      }
    }
  }

  return {
    processedCode: allProcessedCode,
    totalOriginalChars,
    totalOriginalLines,
    totalProcessedChars,
  };
}

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
        logError(`File or directory not found at path: ${filePath}`);
        process.exit(1);
      }
      throw e;
    }

    if (removeConsolesFlag) {
      if (useMinify) {
        logError(
          "The -m (minify) flag cannot be used with -c (remove-consoles). Use one or the other."
        );
        process.exit(1);
      }
    }

    if (stats.isDirectory()) {
      const result = await processDirectory(filePath, useMinify, removeConsolesFlag);
      if (result && !removeConsolesFlag) {
        const combinedCode = result.processedCode.join('\n\n');
        await clipboard.write(combinedCode);
        logDirectoryProcessed(
          result.totalOriginalChars,
          result.totalOriginalLines,
          result.totalProcessedChars
        );
      }
    } else {
      const result = await processSingleFile(filePath, useMinify, removeConsolesFlag);
      if (result && !removeConsolesFlag) {
        await clipboard.write(result.code);
        logFileProcessed(
          result.originalChars,
          result.originalLines,
          result.processedChars
        );
      }
    }
  } catch (error) {
    const baseName = path.basename(filePath || "input");

    if (error.code === "ENOENT") {
      logError(`File or directory not found: ${filePath}`);
    }
    else if (!removeConsolesFlag && error instanceof Terser.TSError) {
      logError(
        `JS Minification Error in ${baseName}: ${error.message} (line: ${error.line}, col: ${error.col})`
      );
    }
    else if (
      removeConsolesFlag &&
      error.message?.includes("Console removal failed")
    ) {
      logError(
        `Console removal operation failed for ${baseName}. See details above.`
      );
    }
    else {
      logError(
        `An unexpected error occurred processing ${baseName}: ${
          error.message || error
        }`
      );
    }
    process.exit(1);
  }
}
