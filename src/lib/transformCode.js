import * as Terser from "terser";

export async function transformCode(code, isMinifyEnabled) {
  try {
    const options = {
      compress: isMinifyEnabled ? {} : false,
      mangle: isMinifyEnabled ? true : false,
      format: {
        comments: false,
      },
      sourceMap: false,
    };
    const result = await Terser.minify(code, options);
    if (result.error) {
      throw result.error;
    }
    return result.code;
  } catch (error) {
    console.error("Error during code transformation:", error);
    throw error;
  }
}
