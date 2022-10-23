import { createPool } from '../pkg/data/postgres/db';
import { lifecycle } from '../pkg/shared/lifecycle';
import { logger } from '../pkg/shared/logger';
import { CONFIG } from './config';
import { startCheckoutPm } from './pm';

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

logger.info('Config', {
    database: {
        host: CONFIG.database.host,
        user: CONFIG.database.user,
        port: CONFIG.database.port,
        database: CONFIG.database.database,
    },
});

const pool = createPool(CONFIG.database);
lifecycle.on('close', () => pool.end());

startCheckoutPm();
