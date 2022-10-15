import { MemoryEventStore } from '../../data/memory/memory-event-store';
import { DomainEventStore } from '../domain-event-store';
import { OrderService } from './order-service';

describe('OrderService', () => {
    let eventStore: DomainEventStore;
    let service: OrderService;

    beforeEach(() => {
        eventStore = new MemoryEventStore();
        service = new OrderService(eventStore);
    });

    describe('addItem', () => {
        it('should add the item and create order when no events exist', async () => {
            const orderId = 'order-id';
            const itemId = 'item-id';

            const { created, duplicate } = await service.addItem(orderId, itemId);
            const stream = await eventStore.loadStream(orderId, 'ORDER_FLOW');

            expect(created).toBeTruthy();
            expect(duplicate).toBeFalsy();
            expect(stream).toEqual([
                {
                    streamId: orderId,
                    streamType: 'ORDER_FLOW',
                    eventType: 'ORDER_ITEM_ADDED',
                    version: 1,
                    payload: { itemId },
                },
            ]);
        });

        it('should add new item when existing item is different', async () => {
            const orderId = 'order-id';
            const itemId = 'item-id-2';

            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: 'item-id-1' },
            });
            const { created, duplicate } = await service.addItem(orderId, itemId);
            const stream = await eventStore.loadStream(orderId, 'ORDER_FLOW');

            expect(created).toBeFalsy();
            expect(duplicate).toBeFalsy();
            expect(stream[1]).toEqual({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 2,
                payload: { itemId },
            });
        });

        it('shouldnt add the new item and mark it as duplicate', async () => {
            const orderId = 'order-id';
            const itemId = 'item-id';

            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId },
            });
            const { created, duplicate } = await service.addItem(orderId, itemId);
            const stream = await eventStore.loadStream(orderId, 'ORDER_FLOW');

            expect(created).toBeFalsy();
            expect(duplicate).toBeTruthy();
            expect(stream.length).toBe(1);
        });
    });
});
