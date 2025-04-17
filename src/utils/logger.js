import path from "path";

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

export function logFileModified(filePath, originalChars, processedChars) {
  const reduction = originalChars - processedChars;
  logSeparator();
  logSuccess(`Console logs removed from file: ${path.basename(filePath)}`);
  logInfo(`   Removed ${reduction} characters.`);
  logInfo(`   File modified successfully.`);
  logEndSeparator();
}

export function logFileUnchanged(filePath) {
  logSeparator();
  logInfo(`ℹ️ No console logs found to remove in: ${path.basename(filePath)}`);
  logInfo(`   File remains unchanged.`);
  logEndSeparator();
}
