import { PgBookmarkRepo } from '../pkg/data/postgres/pg-bookmark-repo';
import { DomainEvent, DomainEventStoreReader, DomainEventStoreWriter } from '../pkg/domain/domain-event-store';
import { Order } from '../pkg/domain/order/order';
import { PersistedEvent } from '../pkg/event-store/events';
import { EmailServiceIntegration } from '../pkg/integrations/email/email-integration';
import { Consumer } from '../pkg/process-manager/consumer';
import { logger } from '../pkg/shared/logger';

export class CheckoutEventConsumer implements Consumer<DomainEvent> {
    constructor(
        private readonly bookmarkRepo: PgBookmarkRepo,
        private readonly eventStoreReader: DomainEventStoreReader,
        private readonly eventStoreWriter: DomainEventStoreWriter,
        private readonly emailService: EmailServiceIntegration
    ) {}

    async consumeEvents(events: PersistedEvent<DomainEvent>[]) {
        for (let event of events) {
            if (event.eventType !== 'ORDER_CHECKED_OUT') {
                continue;
            }

            const events = await this.eventStoreReader.loadStream(event.streamId, 'ORDER_FLOW');
            const order = new Order(event.streamId).buildFrom(events);

            await this.emailService.sendEmail({
                template: 'CHECKOUT',
                payload: {
                    orderId: order.id,
                    totalPrice: order.totalPrice as number,
                    items: order.items,
                },
            });

            await this.eventStoreWriter.save({
                streamId: order.id,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_CONFIRMED',
                version: order.version + 1,
                payload: {},
            });

            logger.info('Processed checkout', { orderId: order.id });
        }

        await this.bookmarkRepo.set({
            id: events[events.length - 1].id,
            insertingTxid: events[events.length - 1].insertingTXID,
        });
    }
}
