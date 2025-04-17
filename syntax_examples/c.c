// Simple C Example
#include <stdio.h>

/*
 * Multi-line comment
 * explaining the function.
 */
void greet(const char* name) {
    printf("Hello, %s!\n", name); // Print greeting
}

int main() {
    const char* user = "C Programmer";
    greet(user); // Function call
    return 0;
}