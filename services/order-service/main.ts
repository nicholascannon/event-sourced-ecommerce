import { createPool } from '../pkg/data/postgres/db';
import { PgEventStore } from '../pkg/data/postgres/pg-event-store';
import { HttpProductIntegration } from '../pkg/integrations/product/product-integration';
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

logger.info('Config', {
    port: CONFIG.port,
    database: {
        host: CONFIG.database.host,
        user: CONFIG.database.user,
        port: CONFIG.database.port,
        database: CONFIG.database.database,
    },
    productServiceHost: CONFIG.productServiceHost,
});

const pool = createPool(CONFIG.database);
const eventStore = new PgEventStore(pool);
const productIntegration = new HttpProductIntegration(CONFIG.productServiceHost);

const app = createApp(eventStore, productIntegration, { logHttpRequests: true });

const server = app.listen(CONFIG.port, () => {
    logger.info('Service started', { port: CONFIG.port });

    lifecycle.on('close', () =>
        server.close(() => {
            logger.info('Service stopped');
            pool.end(() => logger.info('Pool closed')); // close DB only after service is closed
        })
    );
});
