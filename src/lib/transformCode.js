// src/lib/transformCode.js

import * as Terser from "terser";
import path from "path";

export async function transformCode(
  code,
  isMinifyEnabled,
  filename = "input.js"
) {
  // If minification is NOT requested, return the original code immediately.
  if (!isMinifyEnabled) {
    return code;
  }

  // Only proceed with Terser if isMinifyEnabled is true
  try {
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
    return result.code;
  } catch (error) {
    const baseName = path.basename(filename);
    console.error(
      `Error during Terser transformation (${baseName}):`,
      error.message || error
    );
    throw new Error(`Minification failed for ${baseName}.`);
  }
}
