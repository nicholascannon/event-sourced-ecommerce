import { setTimeout } from 'timers/promises';
import { Reader } from './reader';
import { Consumer } from './consumer';
import { lifecycle } from '../shared/lifecycle';
import { logger } from '../shared/logger';
import { BaseEvent } from '../event-store/events';

export async function startProcessManager<E extends BaseEvent>(
    reader: Reader<E>,
    consumer: Consumer<E>,
    options: { batchSize: number; delay: number }
) {
    const { batchSize, delay } = options;

    while (lifecycle.isRunning()) {
        const events = await reader.readEvents(batchSize);
        if (events.length === 0) {
            logger.info('No events read, delaying PM', { delay });
            await setTimeout(delay);
            continue;
        }

        await consumer.consumeEvents(events);
        logger.info('Processed batch', {
            eventsProcessed: events.length,
            from: events[0].id,
            to: events[events.length - 1].id,
        });
    }
}
