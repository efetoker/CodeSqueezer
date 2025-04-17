// Simple Java Example
package example; // Added package declaration

public class Example {
    /**
     * JavaDoc comment
     * @param name The name to greet
     */
    public static void greet(String name) {
        // Print greeting
        System.out.println("Hello, " + name + "!");
    }

    public static void main(String[] args) {
        String user = "Java Developer";
        greet(user); /* C-style comment */
    }
}