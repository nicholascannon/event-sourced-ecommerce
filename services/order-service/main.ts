import { lifecycle } from '../pkg/shared/lifecycle';
import { createPool } from '../pkg/data/postgres/db';
import { PgEventStore } from '../pkg/data/postgres/pg-event-store';
import { HttpProductIntegration } from '../pkg/integrations/product/product-integration';
import { logger, setupProcessLogging } from '../pkg/shared/logger';
import { createApp } from './app';
import { CONFIG } from './config';

setupProcessLogging();

logger.info('Config', {
    port: CONFIG.port,
    database: {
        host: CONFIG.database.host,
        user: CONFIG.database.user,
        port: CONFIG.database.port,
        database: CONFIG.database.database,
    },
    productServiceHost: CONFIG.productServiceHost,
    corsOrigins: CONFIG.corsOrigins,
});

const pool = createPool(CONFIG.database);
const eventStore = new PgEventStore(pool);
const productIntegration = new HttpProductIntegration(CONFIG.productServiceHost);

const app = createApp(eventStore, productIntegration, { logHttpRequests: true, corsOrigins: CONFIG.corsOrigins });

const server = app.listen(CONFIG.port, () => {
    logger.info('Service started', { port: CONFIG.port });

    lifecycle.on('close', () =>
        server.close(() => {
            logger.info('Service stopped');
            pool.end(() => logger.info('Pool closed')); // close DB only after service is closed
        })
    );
});
