// Start
console.log('Starting...');
function work() {
    console.warn('Doing work...');
    let i = 0;
    i++;
    console.debug({ value: i });
    return i > 0;
}
work();
console.error('Finished with potential issue.');