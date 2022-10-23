import { MemoryEventStore } from '../../pkg/data/memory/memory-event-store';
import { DomainEventStore } from '../../pkg/domain/domain-event-store';
import { MockProductIntegration } from '../../pkg/integrations/product/product-integration';
import { createApp } from '../app';
import request from 'supertest';
import { ORDER_ID, products } from './test-data';

describe('/v1/orders/:orderId/checkout', () => {
    let app: Express.Application;
    let eventStore: DomainEventStore;

    beforeEach(() => {
        eventStore = new MemoryEventStore();
        app = createApp(eventStore, new MockProductIntegration(products));
    });

    it('should return 400 for non UUID order id', async () => {
        const { status } = await request(app).post(`/v1/orders/TEST/checkout`);
        expect(status).toBe(400);
    });

    it('should checkout an order', async () => {
        // Create an order and some items
        await eventStore.save({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_ITEM_ADDED',
            version: 1,
            payload: { itemId: products[0].id },
        });
        await eventStore.save({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_ITEM_ADDED',
            version: 2,
            payload: { itemId: products[1].id },
        });

        const { status } = await request(app).post(`/v1/orders/${ORDER_ID}/checkout`);
        const stream = await eventStore.loadStream(ORDER_ID, 'ORDER_FLOW');

        expect(status).toBe(200);
        expect(stream[2]).toEqual({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_CHECKED_OUT',
            version: 3,
            payload: {
                totalPrice: products[0].price + products[1].price,
            },
        });
    });

    it('should fail to checkout an order that does not exist', async () => {
        const { status, body } = await request(app).post(`/v1/orders/${ORDER_ID}/checkout`);
        expect(status).toBe(400);
        expect(body).toEqual({ message: 'Cannot complete action on unknown order', orderId: ORDER_ID });
    });

    it('should not checkout an order that is already checked out', async () => {
        // Checkout an order
        await eventStore.save({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_CHECKED_OUT',
            version: 2,
            payload: {
                totalPrice: 5,
            },
        });

        const { status, body } = await request(app).post(`/v1/orders/${ORDER_ID}/checkout`);
        const stream = await eventStore.loadStream(ORDER_ID, 'ORDER_FLOW');

        expect(status).toBe(403);
        expect(body).toEqual({ message: 'Cannot complete action on checked out order', orderId: ORDER_ID });
        expect(stream.length).toBe(1); // no events added
    });

    it('should not checkout an order with invalid items', async () => {
        const invalidItemId = 'c18110c6-1c70-4689-9037-41b5575f0751';

        // Add some valid items
        await eventStore.save({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_ITEM_ADDED',
            version: 1,
            payload: { itemId: products[0].id },
        });

        // Item saved here was valid but at time of checkout it's invalid
        await eventStore.save({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_ITEM_ADDED',
            version: 3,
            payload: {
                itemId: invalidItemId,
            },
        });

        const { status, body } = await request(app).post(`/v1/orders/${ORDER_ID}/checkout`);
        const stream = await eventStore.loadStream(ORDER_ID, 'ORDER_FLOW');

        expect(status).toBe(400);
        expect(body).toEqual({ message: 'Invalid order item', itemIds: [invalidItemId] });
        expect(stream.length).toBe(2); // no events added
    });
});