import { MemoryEventStore } from '../../pkg/data/memory/memory-event-store';
import { DomainEventStore } from '../../pkg/domain/domain-event-store';
import { MockProductIntegration } from '../../pkg/integrations/product/product-integration';
import { createApp } from '../app';
import request from 'supertest';

describe('order-service', () => {
    let app: Express.Application;
    let es: DomainEventStore;

    beforeEach(() => {
        es = new MemoryEventStore();
        app = createApp(es, new MockProductIntegration([]));
    });

    describe('/healthcheck', () => {
        it('should return healthy', async () => {
            const { body, headers, status } = await request(app).get('/healthcheck');

            expect(status).toBe(200);
            expect(body).toEqual({ status: 'healthy' });
            expect(headers['content-type']).toContain('application/json');
        });
    });

    describe('/orders/:orderId', () => {
        it('should return 404 for order that does not exist', async () => {
            const { status } = await request(app).get('/v1/orders/be810914-6487-4a0b-870e-61cfca2f96c7');
            expect(status).toBe(404);
        });

        it('should return 400 for non UUID order id', async () => {
            const { status } = await request(app).get('/v1/orders/test');
            expect(status).toBe(400);
        });

        it('should return order', async () => {
            const orderId = '956a7e01-1e34-4fc8-9b50-ffb522ddb810';
            const itemId = '9f4d9a4b-8c9c-4951-ac4b-868ec3edbdbd';

            await es.save({
                streamId: orderId,
                eventType: 'ORDER_ITEM_ADDED',
                streamType: 'ORDER_FLOW',
                version: 1,
                payload: { itemId },
            });

            const { status, body } = await request(app).get(`/v1/orders/${orderId}`);
            expect(status).toBe(200);
            expect(body).toEqual({
                id: orderId,
                status: 'IN_PROGRESS',
                items: [itemId],
                version: 1,
            });
        });
    });
});
