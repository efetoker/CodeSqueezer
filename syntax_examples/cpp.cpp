// Simple C++ Example
#include <iostream>
#include <string>

/* Function to greet */
void greet(const std::string& name) {
    // Using cout for output
    std::cout << "Hello, " << name << "!" << std::endl;
}

int main() {
    std::string user = "C++ Dev";
    greet(user); // Calling greet
    return 0;
}