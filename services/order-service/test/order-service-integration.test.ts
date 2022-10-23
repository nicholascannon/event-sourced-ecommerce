import { MemoryEventStore } from '../../pkg/data/memory/memory-event-store';
import { DomainEventStore } from '../../pkg/domain/domain-event-store';
import { MockProductIntegration, Product } from '../../pkg/integrations/product/product-integration';
import { createApp } from '../app';
import request from 'supertest';

describe('order-service', () => {
    let app: Express.Application;
    let eventStore: DomainEventStore;
    let products: Product[] = [
        {
            id: 'a1d56377-a92f-43a3-b047-9d9274e962c7',
            name: 'Item 1',
            price: 5.0,
        },
        {
            id: '783e13fb-1e12-49c2-abd9-7cda84c0e677',
            name: 'Item 2',
            price: 10.0,
        },
    ];
    const ORDER_ID = '956a7e01-1e34-4fc8-9b50-ffb522ddb810';
    const INVALID_ITEM_ID = '7775a6db-430a-417b-b13c-4656be6d34b1';

    beforeEach(() => {
        eventStore = new MemoryEventStore();
        app = createApp(eventStore, new MockProductIntegration(products));
    });

    describe('/healthcheck', () => {
        it('should return healthy', async () => {
            const { body, headers, status } = await request(app).get('/healthcheck');

            expect(status).toBe(200);
            expect(body).toEqual({ status: 'healthy' });
            expect(headers['content-type']).toContain('application/json');
        });
    });

    describe('/v1/orders/:orderId', () => {
        it('should return 404 for order that does not exist', async () => {
            const { status } = await request(app).get('/v1/orders/be810914-6487-4a0b-870e-61cfca2f96c7');
            expect(status).toBe(404);
        });

        it('should return 400 for non UUID order id', async () => {
            const { status } = await request(app).get('/v1/orders/test');
            expect(status).toBe(400);
        });

        it('should return order', async () => {
            // Add item
            await eventStore.save({
                streamId: ORDER_ID,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: products[0].id },
            });

            // Checkout order
            await eventStore.save({
                streamId: ORDER_ID,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_CHECKED_OUT',
                version: 2,
                payload: {
                    totalPrice: 5.0,
                },
            });

            const { status, body } = await request(app).get(`/v1/orders/${ORDER_ID}`);
            expect(status).toBe(200);
            expect(body).toEqual({
                id: ORDER_ID,
                status: 'CHECKED_OUT',
                items: [products[0].id],
                version: 2,
            });
        });
    });

    describe('/v1/orders/:orderId/add/:itemId', () => {
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
                    payload: { itemId: products[0].id },
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
                payload: { itemId: products[0].id },
            });

            const { status } = await request(app).post(`/v1/orders/${ORDER_ID}/add/${products[1].id}`);
            const stream = await eventStore.loadStream(ORDER_ID, 'ORDER_FLOW');

            expect(status).toBe(200);
            expect(stream[1]).toEqual({
                streamId: ORDER_ID,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 2,
                payload: { itemId: products[1].id },
            });
        });

        it('should not add a duplicate item to the order', async () => {
            // Add item to order
            await eventStore.save({
                streamId: ORDER_ID,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: products[0].id },
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

    describe('/v1/orders/:orderId/checkout', () => {
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
});
