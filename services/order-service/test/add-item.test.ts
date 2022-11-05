import { MemoryEventStore } from '../../pkg/data/memory/memory-event-store';
import { DomainEventStore } from '../../pkg/domain/domain-event-store';
import { MockProductIntegration } from '../../pkg/integrations/product/product-integration';
import { createApp } from '../app';
import request from 'supertest';
import { INVALID_ITEM_ID, ORDER_ID, products } from './test-data';

describe('/v1/orders/:orderId/add/:itemId', () => {
    let app: Express.Application;
    let eventStore: DomainEventStore;

    beforeEach(() => {
        eventStore = new MemoryEventStore();
        app = createApp(eventStore, new MockProductIntegration(products));
    });

    it('should return 400 for non UUID order id', async () => {
        const { status } = await request(app).post(`/v1/orders/TEST/add/${products[0].id}`);
        expect(status).toBe(400);
    });

    it('should return 400 for non UUID product id', async () => {
        const { status } = await request(app).post(`/v1/orders/${ORDER_ID}/add/TEST`);
        expect(status).toBe(400);
    });

    it('should add item and create order if one doesnt exist under that UUID', async () => {
        const { status } = await request(app).post(`/v1/orders/${ORDER_ID}/add/${products[0].id}`);
        const stream = await eventStore.loadStream(ORDER_ID, 'ORDER_FLOW');

        expect(status).toBe(201);
        expect(stream).toEqual([
            {
                streamId: ORDER_ID,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: products[0].id, name: products[0].name },
            },
        ]);
    });

    it('should add item to an existing order', async () => {
        // Setup existing order
        await eventStore.save({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_ITEM_ADDED',
            version: 1,
            payload: { itemId: products[0].id, name: products[0].name },
        });

        const { status } = await request(app).post(`/v1/orders/${ORDER_ID}/add/${products[1].id}`);
        const stream = await eventStore.loadStream(ORDER_ID, 'ORDER_FLOW');

        expect(status).toBe(200);
        expect(stream[1]).toEqual({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_ITEM_ADDED',
            version: 2,
            payload: { itemId: products[1].id, name: products[1].name },
        });
    });

    it('should not add a duplicate item to the order', async () => {
        // Add item to order
        await eventStore.save({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_ITEM_ADDED',
            version: 1,
            payload: { itemId: products[0].id, name: products[0].name },
        });

        const { status } = await request(app).post(`/v1/orders/${ORDER_ID}/add/${products[0].id}`);
        const stream = await eventStore.loadStream(ORDER_ID, 'ORDER_FLOW');

        expect(status).toBe(202);
        expect(stream.length).toBe(1); // no events added
    });

    it('should not allow items to be added to checked out orders', async () => {
        await eventStore.save({
            streamId: ORDER_ID,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_CHECKED_OUT',
            version: 2,
            payload: {
                totalPrice: 5.0,
            },
        });

        const { status, body } = await request(app).post(`/v1/orders/${ORDER_ID}/add/${products[0].id}`);
        const stream = await eventStore.loadStream(ORDER_ID, 'ORDER_FLOW');

        expect(status).toBe(403);
        expect(body).toEqual({ message: 'Cannot complete action on checked out order', orderId: ORDER_ID });
        expect(stream.length).toBe(1); // no events added
    });

    it('should not allow invalid items to be added to orders', async () => {
        const { status, body } = await request(app).post(`/v1/orders/${ORDER_ID}/add/${INVALID_ITEM_ID}`);
        expect(status).toBe(400);
        expect(body).toEqual({ message: 'Invalid order item', itemIds: [INVALID_ITEM_ID] });
    });
});
