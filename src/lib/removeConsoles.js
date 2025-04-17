import ts from "typescript";
import path from "path";

// Helper to log errors minimally within this isolated function
function logLibError(message) {
  console.error(`❌ Error: ${message}`);
}

// Helper function to check if a node is a console.log/warn/etc. call expression
function isConsoleCallExpression(node) {
  if (!ts.isCallExpression(node)) {
    return false;
  }
  const expr = node.expression;
  // Check for console.*
  if (
    ts.isPropertyAccessExpression(expr) &&
    ts.isIdentifier(expr.expression) &&
    expr.expression.text === "console"
  ) {
    // Could check for specific methods: ts.isIdentifier(expr.name) && ['log', 'warn', ...].includes(expr.name.text)
    // For now, let's remove any console.ANYTHING() call
    return ts.isIdentifier(expr.name);
  }
  return false;
}

export function removeConsolesPrecise(code, filename) {
  try {
    const sourceFile = ts.createSourceFile(
      filename,
      code,
      ts.ScriptTarget.Latest,
      true // setParentNodes needed for finding statement boundaries potentially
    );

    const removalRanges = [];

    function visit(node) {
      // Check if the current node is an ExpressionStatement containing a console call
      if (
        ts.isExpressionStatement(node) &&
        isConsoleCallExpression(node.expression)
      ) {
        // Get precise start/end character positions of the statement
        removalRanges.push([node.getStart(), node.getEnd()]);
        return; // Don't visit child nodes of the console call statement
      }
      // Continue traversal
      ts.forEachChild(node, visit);
    }

    visit(sourceFile); // Start visiting top-level nodes

    if (removalRanges.length === 0) {
      return code; // No changes needed
    }

    // Sort ranges descending by start index to process from end to start
    removalRanges.sort((a, b) => b[0] - a[0]);

    let processedCode = code;
    for (const [start, end] of removalRanges) {
      // Simple but effective: Remove the exact range identified by the parser
      // We will clean up blank lines later.
      processedCode = processedCode.slice(0, start) + processedCode.slice(end);
    }

    // Clean up extra blank lines that might result from removal
    // Replace 3 or more newlines with just two
    processedCode = processedCode.replace(/(\r?\n){3,}/g, "\n\n");
    // Replace lines containing only whitespace
    processedCode = processedCode.replace(/^\s+$/gm, "");
    // Trim leading/trailing whitespace overall
    processedCode = processedCode.trim();

    // Ensure a single trailing newline if the original code had one
    if (
      code.length > 0 &&
      code.trim().length > 0 &&
      code.endsWith("\n") &&
      !processedCode.endsWith("\n")
    ) {
      processedCode += "\n";
    }

    return processedCode;
  } catch (error) {
    const baseName = path.basename(filename);
    let errorDetails = error.message || String(error);

    // Check if it's a TypeScript diagnostic error
    if (error.diagnostics && error.diagnostics.length > 0) {
      const diag = error.diagnostics[0];
      if (diag.file && typeof diag.start === "number") {
        try {
          // Safely get line/char
          const { line, character } = ts.getLineAndCharacterOfPosition(
            diag.file,
            diag.start
          );
          errorDetails = `${diag.messageText} (line ${line + 1}, character ${
            character + 1
          })`;
        } catch (_) {
          errorDetails = diag.messageText; // Fallback if position fails
        }
      } else {
        errorDetails = diag.messageText;
      }
    }
    logLibError(
      `Error processing ${baseName} for console removal: ${errorDetails}`
    );
    throw new Error(`Console removal failed for ${baseName}.`); // Rethrow generic error
  }
}
