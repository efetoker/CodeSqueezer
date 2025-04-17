// tests/runCommand.js
import { execFile } from 'child_process';
import util from 'util';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url'; // To resolve paths in ESM

const execFilePromise = util.promisify(execFile);

// Resolve paths relative to the project root (assuming tests/ is in root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // Go up one level from tests/
const cliPath = path.resolve(projectRoot, 'src/cli.js'); // Path to your entry point

/**
 * Runs the CLI command as a subprocess.
 * @param {string[]} [args=[]] - Array of arguments to pass to the CLI.
 * @param {string} [cwd=projectRoot] - Working directory for the command.
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
export async function runCommand(args = [], cwd = projectRoot) {
    try {
        const { stdout, stderr } = await execFilePromise(process.execPath, [cliPath, ...args], {
             cwd: cwd,
             windowsHide: true,
             env: { ...process.env, // Pass environment variables
                    NODE_OPTIONS: '--experimental-vm-modules' // Needed for Jest ESM support if cli.js is ESM
                  }
         });
        return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0 };
    } catch (error) {
        // error contains stdout, stderr, code etc. when execFile rejects
        return {
            stdout: (error.stdout || '').trim(),
            stderr: (error.stderr || error.message).trim(),
            exitCode: typeof error.code === 'number' ? error.code : 1,
        };
    }
}