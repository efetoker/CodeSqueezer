// Simple TypeScript example
interface Greeter {
    greeting: string;
  }
  function greetUser(person: string): string {
    // Single line comment
    return `Hello, ${person}!`;
  }
  let currentUser: string = "TypeScript User";
  console.log(greetUser(currentUser));