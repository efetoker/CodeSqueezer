# CodeSqueezer

[![NPM Version](https://img.shields.io/npm/v/codesqueezer.svg?style=flat-square)](https://www.npmjs.com/package/codesqueezer) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A powerful command-line tool that prepares your code for AI chatbot interactions by making it more compact and context-friendly. Perfect for developers who frequently share code with AI assistants.

## 🚀 Features

- **Smart Code Processing**
  - Removes comments and unnecessary whitespace
  - Preserves code functionality
  - Maintains file structure and readability
  - Adds file path comments for context

- **TypeScript & JavaScript Support**
  - Handles both `.js` and `.ts` files
  - Preserves TypeScript syntax and types
  - Smart minification for both languages
  - Supports modern JavaScript/TypeScript features

- **Directory Processing**
  - Process entire directories recursively
  - Combines multiple files with proper separation
  - Skips common directories (node_modules, .git, etc.)
  - Maintains file hierarchy in output

- **Multiple Processing Modes**
  - Basic mode: Simple code flattening
  - Minification mode: Full code compression
  - Console removal mode: Remove console statements
  - Directory tree display

## 📦 Installation

Install globally to use anywhere:

```bash
npm install -g codesqueezer
```

Or use directly with npx:

```bash
npx codesqueezer <filepath> [options]
```

## 💻 Usage

### Basic Usage

Process a single file:

```bash
# Process a JavaScript file
codesqueezer src/example.js

# Process a TypeScript file
codesqueezer src/example.ts
```

Process an entire directory:

```bash
# Process all files in a directory
codesqueezer src/

# Process a specific subdirectory
codesqueezer src/components/
```

### Minification Mode

Enable full minification with the `-m` flag:

```bash
# Minify a single file
codesqueezer src/example.js -m
codesqueezer src/example.ts -m

# Minify an entire directory
codesqueezer src/ -m
```

### Console Removal Mode

Remove console statements from files:

```bash
# Remove consoles from a single file
codesqueezer src/example.js -c

# Remove consoles from an entire directory
codesqueezer src/ -c
```

### Directory Tree Display

View directory structure:

```bash
# Show current directory structure
codesqueezer tree

# Show specific directory structure
codesqueezer tree src/
```

## 🔧 Options

| Option | Alias | Description |
|--------|-------|-------------|
| `-m` | `--minify` | Enable full minification |
| `-c` | `--remove-consoles` | Remove console statements |
| `tree [dirpath]` | - | Display directory structure |

## 📝 Output Format

### Single File Output
```typescript
// src/components/Button.tsx
export const Button = ({ children }) => <button>{children}</button>;
```

### Directory Output
```typescript
// src/components/Button.tsx
export const Button = ({ children }) => <button>{children}</button>;

// src/components/Input.tsx
export const Input = ({ value }) => <input value={value} />;

// src/utils/helpers.ts
export const formatDate = (date) => date.toLocaleDateString();
```

## ⚙️ Configuration

The tool automatically:
- Skips `node_modules`, `.git`, `dist`, and `build` directories
- Processes `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, and `.cjs` files
- Preserves TypeScript syntax and types
- Maintains file hierarchy in output

## 🛠️ Technical Details

- Uses `swc` for TypeScript processing
- Uses `terser` for JavaScript minification
- Preserves TypeScript syntax and types
- Handles modern JavaScript/TypeScript features
- Supports recursive directory processing

## 📊 Statistics

The tool provides detailed statistics:
- Original character count
- Processed character count
- Percentage reduction
- Line count information

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [swc](https://swc.rs/) - Speedy Web Compiler
- [terser](https://terser.org/) - JavaScript minifier
- [clipboardy](https://github.com/sindresorhus/clipboardy) - Cross-platform clipboard handling