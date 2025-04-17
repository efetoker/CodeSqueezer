// Simple Go Example
package main

import "fmt"

/*
Function to greet someone.
Takes a name and prints a message.
*/
func greet(name string) {
    // Print the greeting message using Printf
    fmt.Printf("Hello, %s!\n", name)
}

// Main function - entry point
func main() {
    user := "Gopher" // Declare and initialize user
    greet(user) // Call the function
}