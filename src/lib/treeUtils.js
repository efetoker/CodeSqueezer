import fs from "fs/promises";
import path from "path";

export async function displayTree(
  dirPath,
  outputLines,
  prefix = "",
  isRoot = true
) {
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
      const newPrefix = prefix + (isLast ? "    " : "│   "); // Corrected spacing
      await displayTree(entryPath, outputLines, newPrefix, false);
    }
  }
}
