<?php
// Simple PHP Example

/**
 * Greets a user.
 * @param string $name The name to greet.
 * @return void
 */
function greet(string $name): void {
    // Echo the greeting
    echo "Hello, " . htmlspecialchars($name) . "!\n"; # Shell-style comment also works
}

$user = "PHP Scripter";
greet($user); /* C-style comment */

// End of script
?>
<p>Some HTML outside PHP tags.</p>