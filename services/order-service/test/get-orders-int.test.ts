import { MemoryEventStore } from '../../pkg/data/memory/memory-event-store';
import { DomainEventStore } from '../../pkg/domain/domain-event-store';
import { MockProductIntegration } from '../../pkg/integrations/product/product-integration';
import { createApp } from '../app';
import request from 'supertest';
import { products } from '../../pkg/test/test-data';
import { MemoryOrderProjectionRepository } from '../../pkg/data/memory/memory-order-projection-repo';

describe('/v1/orders', () => {
    let app: Express.Application;
    let eventStore: DomainEventStore;
    let projectionRepo: MemoryOrderProjectionRepository;

    beforeEach(() => {
        eventStore = new MemoryEventStore();
        projectionRepo = new MemoryOrderProjectionRepository();
        app = createApp(eventStore, new MockProductIntegration(products), projectionRepo, {
            logHttpRequests: false,
        });
    });

    it('should return empty list when no orders exist', async () => {
        const { status, body } = await request(app).get('/v1/orders');
        expect(status).toBe(200);
        expect(body).toEqual([]);
    });

    it('should return orders', async () => {
        const orderDate = new Date();
        await projectionRepo.save({
            id: '1',
            items: [{ id: products[0].id, name: products[0].name }],
            status: 'CHECKED_OUT',
            totalPrice: 5.0,
            orderDate,
        });
        await projectionRepo.save({
            id: '2',
            items: [{ id: products[1].id, name: products[1].name }],
            status: 'IN_PROGRESS',
        });

        const { status, body } = await request(app).get('/v1/orders');
        expect(status).toBe(200);
        expect(body).toEqual([
            {
                id: '1',
                status: 'CHECKED_OUT',
                items: [{ id: products[0].id, name: products[0].name }],
                orderDate: orderDate.toJSON(),
                totalPrice: 5.0,
            },
            {
                id: '2',
                items: [{ id: products[1].id, name: products[1].name }],
                status: 'IN_PROGRESS',
            },
        ]);
    });
});
