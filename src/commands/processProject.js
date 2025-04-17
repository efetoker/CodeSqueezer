import fs from "fs/promises";
import path from "path";
import clipboard from "clipboardy";
import { displayTree } from "../lib/treeUtils.js"; // Needs the tree generation
import { processDirectoryRecursive } from "../lib/projectProcessor.js"; // Needs the recursive processor
import { logInfo, logError, logProjectProcessed } from "../utils/logger.js";

export async function handleProcessProject(argv) {
  const dirPath = argv.dirpath;
  const useMinify = argv.minify; // Use the -m flag passed for project
  const includeTree = argv.t; // Use the -t flag
  const absolutePath = path.resolve(dirPath);

  logInfo(`Processing project directory: ${absolutePath}...`);
  if (useMinify) logInfo(`   (Minification enabled)`);
  if (includeTree) logInfo(`   (Including directory tree)`);

  try {
    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      logError(`Provided path is not a directory: ${absolutePath}`);
      process.exit(1);
    }

    const outputParts = [];

    // 1. Generate and add tree structure if requested
    if (includeTree) {
      const treeLines = [];
      // Use displayTree, passing the array to populate
      await displayTree(dirPath, treeLines);
      outputParts.push("Project Structure:\n");
      outputParts.push(treeLines.join("\n"));
      outputParts.push(
        "\n\n==================== CODE ====================\n\n"
      ); // Separator
    }

    // 2. Process all files recursively
    const fileResults = [];
    await processDirectoryRecursive(dirPath, dirPath, useMinify, fileResults);

    // Sort results by relative path for predictable order
    fileResults.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

    // 3. Format the processed file contents
    for (const result of fileResults) {
      // Use a clear delimiter including the relative path
      outputParts.push(`// File: ${result.relativePath.replace(/\\/g, "/")}\n`); // Normalize path sep
      outputParts.push(result.processedCode);
      outputParts.push("\n\n"); // Add blank lines between files
    }

    // 4. Combine, copy to clipboard, and log success
    // Trim trailing newlines before final copy
    const finalOutput = outputParts.join("").trimEnd();
    await clipboard.write(finalOutput);

    logProjectProcessed(fileResults.length, finalOutput.length, includeTree);
  } catch (error) {
    if (error.code === "ENOENT") {
      // Error reading initial directory
      logError(`Directory not found at path: ${absolutePath}`);
    } else {
      logError(
        `An unexpected error occurred processing project: ${
          error.message || error
        }`
      );
    }
    process.exit(1);
  }
}
