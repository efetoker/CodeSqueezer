import fs from "fs/promises";
import path from "path";
import clipboard from "clipboardy";
import { displayTree } from "../lib/treeUtils.js";
import { logInfo, logError, logTreeCopied } from "../utils/logger.js";

export async function handleDisplayTree(argv) {
  const dirPath = argv.dirpath;
  const absolutePath = path.resolve(dirPath);
  logInfo(`Generating tree for: ${absolutePath}...`);
  try {
    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      logError(`Provided path is not a directory: ${absolutePath}`);
      process.exit(1);
    }
    const treeLines = [];
    await displayTree(dirPath, treeLines);
    const treeString = treeLines.join("\n");
    await clipboard.write(treeString);

    logTreeCopied(treeLines.length);
  } catch (error) {
    if (error.code === "ENOENT") {
      logError(`Directory not found at path: ${absolutePath}`);
    } else {
      logError(
        `An unexpected error occurred running tree: ${error.message || error}`
      );
    }
    process.exit(1);
  }
}
