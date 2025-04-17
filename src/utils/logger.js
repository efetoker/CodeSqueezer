import path from "path"; // Needed for basename in file modify logs if re-added

const SEPARATOR = "————————————————————————————————————————————";

export function logSeparator() {
  console.log(`\n${SEPARATOR}`);
}

export function logEndSeparator() {
  console.log(`${SEPARATOR}\n`);
}

export function logInfo(message) {
  console.log(message);
}

export function logSuccess(message) {
  console.log(`✅ ${message}`);
}

export function logError(message) {
  console.error(`❌ Error: ${message}`);
}

export function logFileProcessed(originalChars, originalLines, processedChars) {
  const percentageGain =
    originalChars > 0
      ? (((originalChars - processedChars) / originalChars) * 100).toFixed(2)
      : 0;
  const changeDescription =
    originalChars !== processedChars
      ? `${percentageGain}% reduction`
      : `no change`;

  logSeparator();
  logSuccess("Processed code copied to clipboard!\n");
  logInfo(`— Before : ${originalChars} characters (${originalLines} lines)`);
  logInfo(`— After  : ${processedChars} characters (${changeDescription})`);
  logInfo("\nThanks for using CodeSqueezer!");
  logInfo("Context window, here we come! 🔥");
  logEndSeparator();
}

export function logTreeCopied(lineCount) {
  logSeparator();
  logSuccess("Directory tree copied to clipboard!");
  logInfo(`   (${lineCount} lines copied)`);
  logInfo("\nThanks for using CodeSqueezer!");
  logEndSeparator();
}
