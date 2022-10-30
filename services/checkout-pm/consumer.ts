import { PgBookmarkRepo } from '../pkg/data/postgres/pg-bookmark-repo';
import { DomainEvent } from '../pkg/domain/domain-event-store';
import { PersistedEvent } from '../pkg/event-store/events';
import { Consumer } from '../pkg/process-manager/consumer';
import { logger } from '../pkg/shared/logger';

export class CheckoutEventConsumer implements Consumer<DomainEvent> {
    constructor(private readonly bookmarkRepo: PgBookmarkRepo) {}

    async consumeEvents(events: PersistedEvent<DomainEvent>[]) {
        for (let event of events) {
            if (event.eventType !== 'ORDER_CHECKED_OUT') {
                continue;
            }

            logger.info('Order Checked out!', { event });
            // TODO: finish checkout process
        }

        await this.bookmarkRepo.set({
            id: events[events.length - 1].id,
            insertingTxid: events[events.length - 1].insertingTXID,
        });
    }
}
