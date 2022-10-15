import { DomainEventStore } from '../domain-event-store';
import { OrderAggregate } from './order-aggregate';
import { AddItemCommand } from './order-commands';
import { OrderEvent } from './order-events';

export class OrderCommandHandler {
    constructor(private readonly eventStore: DomainEventStore) {}

    async addItem({ orderId, item }: AddItemCommand): Promise<AddItemResponse> {
        const events = await this.eventStore.loadStream<OrderEvent>(orderId, 'ORDER_FLOW');

        const order = new OrderAggregate(orderId);
        order.hydrateState(events);

        if (order.hasItem(item.id)) {
            return { created: false, duplicate: true };
        }

        await this.eventStore.save({
            streamId: orderId,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_ITEM_ADDED',
            version: order.getVersion() + 1,
            payload: {
                itemId: item.id,
                price: item.price,
            },
        });

        if (order.getVersion() === 0) {
            return { created: true, duplicate: false };
        }
        return { created: false, duplicate: false };
    }
}

type AddItemResponse =
    | { created: true; duplicate: false }
    | { created: false; duplicate: true }
    | { created: false; duplicate: false };
