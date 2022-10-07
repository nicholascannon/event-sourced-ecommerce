import { lifecycle } from '../pkg/shared/lifecycle';

console.log('Dummy order service');

const intervalId = setInterval(() => {}, 30_000);
lifecycle.on('close', () => clearInterval(intervalId));
