// tests/cli.test.js - CORRECTED ASSERTIONS
import path from "path";
import fs from "fs/promises";
import clipboard from "clipboardy";
import { runCommand } from "./runCommand.js";
import { fileURLToPath } from "url";
import process from "process"; // Import process for platform check

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, "_fixtures");
const TEMP_DIR = path.resolve(__dirname, "_temp_test_files");

const fixturePath = (filename) => path.join(FIXTURES_DIR, filename);

async function createTempCopy(fixtureFilename) {
  const sourcePath = fixturePath(fixtureFilename);
  const tempPath = path.join(TEMP_DIR, fixtureFilename);
  // Ensure directory exists before copying
  await fs.mkdir(path.dirname(tempPath), { recursive: true });
  await fs.copyFile(sourcePath, tempPath);
  return tempPath;
}

// Setup/Teardown
beforeAll(async () => {
  await fs.mkdir(TEMP_DIR, { recursive: true });
});
afterAll(async () => {
  await fs.rm(TEMP_DIR, { recursive: true, force: true });
});

// --- Test Suite ---
describe("CodeSqueezer CLI", () => {
  test("Default command should process JS file and copy original content", async () => {
    const inputFile = fixturePath("basic.js");
    const originalContent = await fs.readFile(inputFile, "utf8");
    const { stdout, stderr, exitCode } = await runCommand([inputFile]);

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    expect(stdout).toContain("✅ Processed code copied to clipboard!");
    // Check the "After" line specifically for character count matching original
    const match = stdout.match(/— After\s+: (\d+) characters/);
    expect(match).not.toBeNull();
    if (match) {
      // Type guard for match
      expect(parseInt(match[1], 10)).toBe(originalContent.length);
    }
    // Check description contains "no change" (because transformCode now returns original)
    expect(stdout).toContain("no change");
    const clipboardContent = await clipboard.read();
    expect(clipboardContent).toBe(originalContent);
  }, 10000);

  test("Minify command (-m) should process JS file, minify, and copy", async () => {
    const inputFile = fixturePath("basic.js");
    const originalContent = await fs.readFile(inputFile, "utf8");
    const { stdout, stderr, exitCode } = await runCommand([inputFile, "-m"]);

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    expect(stdout).toContain("✅ Processed code copied to clipboard!");
    expect(stdout).toContain("% reduction");
    const clipboardContent = await clipboard.read();
    // Less brittle checks for minified content:
    expect(clipboardContent.length).toBeLessThan(originalContent.length);
    expect(clipboardContent).toContain("greet"); // Check if function name possibly exists (mangled or not)
    expect(clipboardContent).not.toContain("// A simple function"); // Comments should be gone
  }, 10000);

  describe("Console Removal (-c)", () => {
    test("should remove consoles from JS file in-place", async () => {
      const tempFilePath = await createTempCopy("with_consoles.js");
      const { stdout, stderr, exitCode } = await runCommand([
        tempFilePath,
        "-c",
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe("");
      expect(stdout).toContain("✅ Console logs removed from file:");
      expect(stdout).toContain("with_consoles.js");

      const modifiedContent = await fs.readFile(tempFilePath, "utf8");
      expect(modifiedContent).not.toMatch(/console\.(log|warn|error|debug)/);
      expect(modifiedContent).toContain("let i = 0;");
    }, 10000);

    test("should remove consoles from TS file in-place", async () => {
      const tempFilePath = await createTempCopy("basic.ts");
      const { stdout, stderr, exitCode } = await runCommand([
        tempFilePath,
        "-c",
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe("");
      expect(stdout).toContain("✅ Console logs removed from file:");
      expect(stdout).toContain("basic.ts");

      const modifiedContent = await fs.readFile(tempFilePath, "utf8");
      expect(modifiedContent).not.toMatch(/console\.(log|warn|error|debug)/);
      expect(modifiedContent).toContain("interface Greeter");
      expect(modifiedContent).toContain(": Greeter");
    }, 10000);

    test("should report no changes if file has no consoles", async () => {
      const tempFilePath = await createTempCopy("no_consoles.js");
      const originalContent = await fs.readFile(tempFilePath, "utf8");
      const { stdout, stderr, exitCode } = await runCommand([
        tempFilePath,
        "-c",
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe("");
      // Check for key parts of the message separately - CORRECTED first check
      expect(stdout).toContain("ℹ️ No console logs found to remove in:"); // <-- Corrected this line
      expect(stdout).toContain("File remains unchanged."); // This line was okay
      const currentContent = await fs.readFile(tempFilePath, "utf8");
      expect(currentContent).toBe(originalContent);
    }, 10000);

    test("should error if -c used on non-JS/TS file", async () => {
      const inputFile = fixturePath("non_js.txt");
      const { stderr, exitCode } = await runCommand([inputFile, "-c"]);
      expect(exitCode).not.toBe(0);
      expect(stderr).toContain("only supported for JavaScript/TypeScript");
    }, 10000);

    test("should error if -c and -m are used together", async () => {
      const inputFile = fixturePath("basic.js");
      const { stderr, exitCode } = await runCommand([inputFile, "-c", "-m"]);
      expect(exitCode).not.toBe(0);
      expect(stderr).toContain("cannot be used with");
    }, 10000);
  });

  describe("Tree command", () => {
    const TREE_TEST_DIR = path.join(TEMP_DIR, "tree_test");
    // Define expected output without OS-specific newlines initially
    const expectedTreeUnix = `tree_test\n├── fileA.js\n└── sub\n    └── fileB.txt`;
    // Adjust expected newlines based on platform for comparison later if needed,
    // but normalizing clipboard output is usually easier.

    beforeAll(async () => {
      await fs.mkdir(path.join(TREE_TEST_DIR, "sub"), { recursive: true });
      await fs.writeFile(path.join(TREE_TEST_DIR, "fileA.js"), "// A");
      await fs.writeFile(path.join(TREE_TEST_DIR, "sub", "fileB.txt"), "B");
    });

    test("should copy directory structure to clipboard", async () => {
      const { stdout, stderr, exitCode } = await runCommand([
        "tree",
        TREE_TEST_DIR,
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe("");
      expect(stdout).toContain("✅ Directory tree copied to clipboard!");
      const clipboardContent = await clipboard.read();
      // Normalize line endings from clipboard content for reliable comparison
      expect(clipboardContent.replace(/\r\n/g, "\n")).toBe(expectedTreeUnix);
    }, 10000);

    test("should error if path is not a directory", async () => {
      const inputFile = fixturePath("basic.js");
      const { stderr, exitCode } = await runCommand(["tree", inputFile]);
      expect(exitCode).not.toBe(0);
      expect(stderr).toContain("Provided path is not a directory");
    }, 10000);
  });

  describe("Error Handling", () => {
    test("should error if input file not found for default command", async () => {
      const { stderr, exitCode } = await runCommand(["nonexistent_file.js"]);
      expect(exitCode).not.toBe(0);
      expect(stderr).toContain("File not found");
    }, 10000);

    test("should error if input file not found for -c command", async () => {
      const { stderr, exitCode } = await runCommand([
        "nonexistent_file.js",
        "-c",
      ]);
      expect(exitCode).not.toBe(0);
      expect(stderr).toContain("File not found");
    }, 10000);

    test("should show help with -h", async () => {
      const { stdout, stderr, exitCode } = await runCommand(["-h"]);
      expect(exitCode).toBe(0);
      expect(stderr).toBe("");
      expect(stdout).toContain("Usage:");
      expect(stdout).toContain("Options:");
    }, 10000);

    test("should error on unknown command (interpreted as file)", async () => {
      const unknownArg = "unknown_command_xyz";
      const { stderr, exitCode } = await runCommand([unknownArg]);
      expect(exitCode).not.toBe(0);
      // Expect "File not found" error because default command treats it as filepath
      expect(stderr).toContain("Error: File not found");
      expect(stderr).toContain(unknownArg);
    }, 10000);

    test("should error if filepath missing for default command", async () => {
      const { stderr, exitCode } = await runCommand([]); // No args
      expect(exitCode).not.toBe(0);
      // Yargs error message for missing required positional argument
      expect(stderr).toMatch(
        /Not enough non-option arguments|Missing required argument: filepath/
      );
    }, 10000);
  });
});
