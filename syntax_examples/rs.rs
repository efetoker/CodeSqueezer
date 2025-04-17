// Simple Rust Example

/// Doc comment for greet function.
/// This function prints a greeting.
fn greet(name: &str) {
    // Print using the println! macro
    println!("Hello, {}!", name);
    /* A block
       comment example */
}

// The main function where execution begins
fn main() {
    let user: &str = "Rustacean"; // Define user variable
    greet(user); // Function time
}