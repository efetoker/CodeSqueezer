# CodeSqueezer

[![NPM Version](https://img.shields.io/npm/v/codesqueezer.svg?style=flat-square)](https://www.npmjs.com/package/codesqueezer) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A command-line tool to process code files, making them more compact and easier to paste into AI chatbots with context limits.

## Problem Solved

Large language models (LLMs) and AI assistants are incredibly helpful for developers, but they often have strict context window limits (character or token counts). Pasting large code files, even single files, can exceed these limits. Manually editing code to fit is time-consuming and risks breaking the code.

`CodeSqueezer` prepares your code for these AI interactions by significantly reducing its character count *without* altering its functionality, then copies the result directly to your clipboard.

## Features (Current)

* **Processes JavaScript Files:** Takes a path to a `.js` file as input.
* **Safe Code Transformation:** Uses the robust [Terser](https://terser.org/) library to parse and transform JavaScript code safely.
    * Removes all comments (`//` and `/* ... */`).
    * Eliminates unnecessary whitespace (newlines, extra spaces, indentation).
* **Optional Full Minification:** Provides a flag (`-m`) to enable Terser's full minification capabilities, including:
    * Code compression (optimizing syntax, removing dead code).
    * Variable renaming/mangling for maximum size reduction.
* **Functional Output:** The resulting code remains syntactically correct and functional JavaScript.
* **Clipboard Integration:** Automatically copies the processed, compact code to your system clipboard, ready to be pasted.
* **Simple CLI:** Easy-to-use command-line interface.

## Installation

You can install `CodeSqueezer` globally to use it anywhere:

```bash
npm install -g codesqueezer
````

*(Replace `codesqueezer` with your actual package name if you chose a different one)*

Alternatively, you can use it directly without installing using `npx`:

```bash
npx codesqueezer <filepath> [options]
```

## Usage

Run the tool by providing the path to the JavaScript file you want to process.

**Basic Usage (Safe Flattening & Comment Removal):**

```bash
codesqueezer path/to/your/code.js
```

This will process the code, remove comments/whitespace, and copy the result to your clipboard. Variable and function names remain unchanged.

**Full Minification (Maximum Size Reduction):**

```bash
codesqueezer path/to/your/code.js -m
```

or

```bash
codesqueezer path/to/your/code.js --minify
```

This performs all the basic steps *plus* applies aggressive compression and renames variables/functions to be as short as possible. This yields the smallest possible output but might be slightly less readable for the AI if it relies heavily on original naming conventions.

## Options

  * `<filepath>`: (Required) The path to the JavaScript file to process.
  * `-m`, `--minify`: (Optional) Flag to enable full minification (compression and variable name mangling).

## Limitations

  * **JavaScript Only:** Currently, `CodeSqueezer` only understands and processes JavaScript files correctly due to its reliance on Terser. Attempting to process other languages will likely result in errors or incorrect output.

## License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).