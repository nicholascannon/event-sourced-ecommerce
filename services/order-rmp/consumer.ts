import { DomainEvent } from '../pkg/domain/domain-event-store';
import { Bookmark } from '../pkg/event-store/bookmark';
import { PersistedEvent } from '../pkg/event-store/events';
import { BookmarkRepo } from '../pkg/process-manager/bookmark';
import { Consumer } from '../pkg/process-manager/consumer';
import { OrderProjectionRepository } from './order-rmp-repository';

export class OrderRMPConsumer implements Consumer<DomainEvent> {
    constructor(
        private readonly bookmarkRepo: BookmarkRepo<Bookmark>,
        private readonly projectionRepo: OrderProjectionRepository
    ) {}

    async consumeEvents(events: PersistedEvent<DomainEvent>[]) {
        for (let event of events) {
            if (event.streamType !== 'CUSTOMER_ORDER') continue;

            const projection = await this.projectionRepo.load(event.streamId);
            switch (event.eventType) {
                case 'ORDER_CHECKED_OUT':
                    projection.status = 'CHECKED_OUT';
                    projection.orderDate = new Date(event.timestamp);
                    projection.totalPrice = event.payload.totalPrice;
                    break;
                case 'ORDER_CONFIRMED':
                    projection.status = 'CONFIRMED';
                    break;
                case 'ORDER_ITEM_ADDED':
                    projection.items.push({ id: event.payload.itemId, name: event.payload.name });
                    break;
            }

            await this.projectionRepo.save(projection);
        }

        await this.bookmarkRepo.set({
            id: events[events.length - 1].id,
            insertingTxid: events[events.length - 1].insertingTXID,
        });
    }
}
