import winston from 'winston';
import expressWinston from 'express-winston';

export const logger = winston.createLogger({
    level: 'info',
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
});

export const silentLogger = winston.createLogger({ silent: true });

export const requestLogger = expressWinston.logger({
    winstonInstance: logger,
    headerBlacklist: ['cookie', 'authorization'],
    ignoreRoute: (req) => req.path === '/healthcheck',
});

export function setupProcessLogging() {
    process
        .on('uncaughtException', (error) => {
            logger.error('uncaughtException', error);
        })
        .on('unhandledRejection', (reason) => {
            logger.error('unhandledRejection', reason);
        })
        .on('SIGTERM', () => {
            logger.info('SIGTERM received');
        })
        .on('SIGINT', () => {
            logger.info('SIGINT received');
        });
}
