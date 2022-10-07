import { runHelloWorld } from '../pkg/sample-func';

runHelloWorld();

const intervalId = setInterval(() => {
    runHelloWorld();
}, 30_000);

process.on('SIGINT', () => {
    console.log('Closing service...');
    clearInterval(intervalId);
});
