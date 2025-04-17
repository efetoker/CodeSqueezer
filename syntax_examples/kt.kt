// Simple Kotlin Example
package org.example // Package declaration

/**
 * Multi-line KDoc comment.
 * Greets the given name.
 * @param name The name to greet.
 */
fun greet(name: String) {
    // Uses string template for easy concatenation
    println("Hello, $name!")
}

/* Entry point */
fun main() {
    val user: String = "Kotlin Coder" // Declare immutable variable
    greet(user) /* Simple block comment */
}