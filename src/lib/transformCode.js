// src/lib/transformCode.js

import * as Terser from "terser";
import path from "path";
import swc from "@swc/core";

// Helper function to get relative path
function getRelativePath(filePath) {
  // Get the current working directory
  const cwd = process.cwd();
  // Convert to relative path
  const relativePath = path.relative(cwd, filePath);
  // Normalize path separators to use forward slashes
  const normalizedPath = relativePath.replace(/\\/g, '/');
  // Remove any parent directory references (../) and project root directory
  return normalizedPath.replace(/^(\.\.\/)*[^/]+\//, '');
}

// Helper function to minify TypeScript code using swc
async function minifyTypeScript(code) {
  const result = await swc.transform(code, {
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: true,
        decorators: true,
      },
      minify: {
        compress: true,
        mangle: true,
      },
      target: "es2022",
    },
    minify: true,
  });
  return result.code;
}

export async function transformCode(
  code,
  isMinifyEnabled,
  filename = "input.js"
) {
  // Add file path as a comment at the top, using relative path
  const filePathComment = `// ${getRelativePath(filename)}\n`;
  
  // Check if it's a TypeScript file
  const isTypeScript = filename.toLowerCase().endsWith('.ts') || 
                      filename.toLowerCase().endsWith('.tsx');

  // If minification is NOT requested, return the original code with the path comment
  if (!isMinifyEnabled) {
    if (isTypeScript) {
      // For TypeScript files, just remove comments and extra whitespace
      const noComments = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      const cleaned = noComments
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
      return filePathComment + cleaned;
    }
    return filePathComment + code;
  }

  try {
    if (isTypeScript) {
      // Use swc for TypeScript files
      const minified = await minifyTypeScript(code);
      return filePathComment + minified;
    }

    // Use Terser for JavaScript files
    const options = {
      compress: {}, // Enable default compression
      mangle: true, // Enable default mangle
      format: {
        comments: false, // Remove comments
      },
      sourceMap: false,
    };
    const result = await Terser.minify(code, options);
    if (result.error) {
      throw result.error;
    }
    return filePathComment + result.code;
  } catch (error) {
    const baseName = path.basename(filename);
    console.error(
      `Error during transformation (${baseName}):`,
      error.message || error
    );
    throw new Error(`Transformation failed for ${baseName}.`);
  }
}
