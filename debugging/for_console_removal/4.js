// This file tests that console logs in strings or comments are ignored
const message =
  "This message contains the text console.log but should not be removed.";
const codeSnippet = "`console.log('This is inside a template literal')`";

// console.log("This is a commented out console log");
/*
Another example:
console.log("Inside a multi-line comment");
*/

function checkString() {
  const importantInfo = "Log format: console.log(message)";
  // This actual log should be removed if -c flag is used
  console.log("Function executed. Checking important info string.");
  return importantInfo;
}

checkString();
// This actual log should also be removed if -c flag is used
console.log("Script finished. Message:", message);
