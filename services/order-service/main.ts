console.log('Dummy order service');

const intervalId = setInterval(() => {}, 30_000);

process.on('SIGINT', () => {
    console.log('Closing service...');
    clearInterval(intervalId);
});
