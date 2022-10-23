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
            id: 'item-id-1',
            name: 'Item 1',
            price: 5.0,
        },
        {
            id: 'item-id-2',
            name: 'Item 2',
            price: 10.0,
        },
    ];
    const ORDER_ID = '956a7e01-1e34-4fc8-9b50-ffb522ddb810';

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
});
