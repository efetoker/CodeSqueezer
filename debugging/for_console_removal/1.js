// Start of script
console.log('Starting process...');
let count = 0;
const MAX = 5;
console.log('Initial count:', count);

function increment() {
    count++;
    console.debug(`Count is now: ${count}`); // Use debug
    if (count > MAX) {
        console.warn(`Count exceeded maximum (${MAX})!`); // Use warn
    }
}

for (let i = 0; i < 7; i++) {
    console.log(`Loop iteration ${i}`);
    increment();
}

console.error('An intentional error log for testing.'); // Use error
console.log('Final count:', count);
console.log('Process finished.');
// End of script