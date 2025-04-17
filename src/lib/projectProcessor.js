import fs from "fs/promises";
import path from "path";
import { transformCode } from "./transformCode.js"; // Uses Terser

// Define ignored directories and supported file extensions
const ignoredDirs = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".vscode",
  "__pycache__",
]);
const supportedExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
]); // Currently JS/TS focused

/**
 * Recursively processes supported files in a directory.
 * @param {string} rootDir - The root directory path of the project (for relative paths).
 * @param {string} currentDir - The current directory being scanned.
 * @param {boolean} minifyFlag - Whether to apply minification.
 * @param {Array<Object>} fileProcessResults - Array to store {relativePath, processedCode}.
 */
export async function processDirectoryRecursive(
  rootDir,
  currentDir,
  minifyFlag,
  fileProcessResults
) {
  let entries;
  try {
    entries = await fs.readdir(currentDir, { withFileTypes: true });
  } catch (error) {
    // Log warning but continue scanning other parts if possible
    console.warn(
      `⚠️ Could not read directory: ${currentDir} - ${error.message}`
    );
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    // Get path relative to the initial root directory for cleaner output
    const relativePath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      // Skip ignored directories
      if (!ignoredDirs.has(entry.name)) {
        await processDirectoryRecursive(
          rootDir,
          fullPath,
          minifyFlag,
          fileProcessResults
        );
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Process only supported file types
      if (supportedExtensions.has(ext)) {
        try {
          const content = await fs.readFile(fullPath, "utf8");
          // Skip potentially huge files? (Optional check)
          // if (content.length > 100000) { // Example limit: 100k chars
          //     console.warn(`⚠️ Skipping large file: ${relativePath}`);
          //     continue;
          // }

          // Use the existing transformCode function
          const processedCode = await transformCode(content, minifyFlag);
          fileProcessResults.push({ relativePath, processedCode });
        } catch (error) {
          console.warn(
            `⚠️ Failed to process file: ${relativePath} - ${error.message}`
          );
          // Optionally add a placeholder indicating the error for this file
          // fileProcessResults.push({ relativePath, processedCode: `// Error processing file: ${error.message}` });
        }
      }
    }
  }
}
