// TypeScript file with various console logs
interface User {
    id: number;
    name: string;
}

function processUser(user: User): void {
    console.log(`Processing user: ${user.name} (ID: ${user.id})`);
    if (user.id < 0) {
        console.warn(`User ID is negative: ${user.id}`);
    }
    // Simulate processing
    console.debug("User processing steps completed.");
}

const newUser: User = { id: 101, name: "Alice" };
const invalidUser: User = { id: -5, name: "Bob" };

console.log("Starting user processing...");
processUser(newUser);
processUser(invalidUser);
console.log("User processing finished.");