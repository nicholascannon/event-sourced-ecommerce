import { lifecycle } from '../pkg/shared/lifecycle';
import { createPool } from '../pkg/data/postgres/db';
import { PgBookmarkRepo } from '../pkg/data/postgres/pg-bookmark-repo';
import { PgEventStore } from '../pkg/data/postgres/pg-event-store';
import { MemoryEmailServiceIntegration } from '../pkg/integrations/email/memory-email-integration';
import { startProcessManager } from '../pkg/process-manager/pm-coordinator';
import { BookmarkedEventReader } from '../pkg/process-manager/reader';
import { logger, setupProcessLogging } from '../pkg/shared/logger';
import { CONFIG } from './config';
import { CheckoutEventConsumer } from './consumer';

const PM_NAME = 'checkout-pm';

setupProcessLogging();

logger.info('Config', {
    pmName: PM_NAME,
    batchSize: CONFIG.batchSize,
    reader: {
        host: CONFIG.reader.host,
        user: CONFIG.reader.user,
        port: CONFIG.reader.port,
        database: CONFIG.reader.database,
    },
    writer: {
        host: CONFIG.writer.host,
        user: CONFIG.writer.user,
        port: CONFIG.writer.port,
        database: CONFIG.writer.database,
    },
});

const readerPool = createPool(CONFIG.reader);
lifecycle.on('close', () => readerPool.end());

const writerPool = createPool(CONFIG.writer);
lifecycle.on('close', () => writerPool.end());

const eventStoreReader = new PgEventStore(readerPool);
const eventStoreWriter = new PgEventStore(writerPool);

const bookmarkRepo = new PgBookmarkRepo(PM_NAME, readerPool);
const startingBookmark = await bookmarkRepo.get();
logger.info('Starting bookmark', { startingBookmark });

const emailService = new MemoryEmailServiceIntegration(logger);

const reader = new BookmarkedEventReader(startingBookmark, eventStoreReader);
const consumer = new CheckoutEventConsumer(bookmarkRepo, eventStoreReader, eventStoreWriter, emailService);

startProcessManager(reader, consumer, { batchSize: CONFIG.batchSize, delay: 1_000 });
