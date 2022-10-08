import { lifecycle } from '../pkg/shared/lifecycle';
import { logger } from '../pkg/shared/logger';
import { createApp } from './app';
import { CONFIG } from './config';

process
    .on('uncaughtException', (error) => {
        logger.error('uncaughtException', error);
    })
    .on('unhandledRejection', (reason) => {
        logger.error('unhandledRejection', { reason });
    })
    .on('SIGTERM', () => {
        logger.info('SIGTERM received');
    })
    .on('SIGINT', () => {
        logger.info('SIGINT received');
    });

const app = createApp();
const server = app.listen(CONFIG.port, () => {
    logger.info('Service started', { port: CONFIG.port });
    lifecycle.on('close', () => server.close(() => logger.info('Service stopped')));
});
