import { createPool } from '../pkg/data/postgres/db';
import { PgBookmarkRepo } from '../pkg/data/postgres/pg-bookmark-repo';
import { PgEventStore } from '../pkg/data/postgres/pg-event-store';
import { startProcessManager } from '../pkg/process-manager/pm-coordinator';
import { BookmarkedEventReader } from '../pkg/process-manager/reader';
import { lifecycle } from '../pkg/shared/lifecycle';
import { logger } from '../pkg/shared/logger';
import { CONFIG } from './config';
import { CheckoutEventConsumer } from './consumer';

const PM_NAME = 'checkout-pm';
const BATCH_SIZE = 10;

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
    pmName: PM_NAME,
    batchSize: BATCH_SIZE,
    database: {
        host: CONFIG.database.host,
        user: CONFIG.database.user,
        port: CONFIG.database.port,
        database: CONFIG.database.database,
    },
});

const pool = createPool(CONFIG.database);
lifecycle.on('close', () => pool.end());

const eventStore = new PgEventStore(pool);
const bookmarkRepo = new PgBookmarkRepo(PM_NAME, pool);
const startingBookmark = await bookmarkRepo.get();

const reader = new BookmarkedEventReader(startingBookmark, eventStore);
const consumer = new CheckoutEventConsumer(bookmarkRepo);

startProcessManager(reader, consumer, { batchSize: BATCH_SIZE, delay: 1_000 });
