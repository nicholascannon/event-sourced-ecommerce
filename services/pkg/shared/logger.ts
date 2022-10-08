import winston from 'winston';
import expressWinston from 'express-winston';

export const logger = winston.createLogger({
    level: 'info',
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
});

export const requestLogger = expressWinston.logger({
    winstonInstance: logger,
    headerBlacklist: ['cookie', 'authorization'],
    ignoreRoute: (req) => req.path === '/healthcheck',
});
