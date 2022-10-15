import { DomainEventStore } from '../domain-event-store';
import { Order } from './order';
import { OrderEvent } from './order-events';

export class OrderService {
    constructor(private readonly eventStore: DomainEventStore) {}

    async addItem(
        orderId: string,
        itemId: string
    ): Promise<{ created: boolean; duplicate: boolean; alreadyCheckedOut: boolean }> {
        const events = await this.eventStore.loadStream<OrderEvent>(orderId, 'ORDER_FLOW');

        const order = new Order(orderId);
        order.buildFrom(events);

        if (order.status !== 'IN_PROGRESS') {
            return { created: false, duplicate: false, alreadyCheckedOut: true };
        }
        if (order.hasItem(itemId)) {
            return { created: false, duplicate: true, alreadyCheckedOut: false };
        }

        const isNewOrder = order.version === 0;

        await this.eventStore.save({
            streamId: orderId,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_ITEM_ADDED',
            version: order.version + 1,
            payload: { itemId },
        });

        return { created: isNewOrder, duplicate: false, alreadyCheckedOut: false };
    }
}
