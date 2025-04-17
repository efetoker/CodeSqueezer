interface Greeter { name: string; }
function greetTs(person: Greeter): void {
  console.log(`Hello, ${person.name}! from TS`);
  // Another comment
}
const userTs: Greeter = { name: "TS Tester" };
console.warn("Calling greetTs...");
greetTs(userTs);