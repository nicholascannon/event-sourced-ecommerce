import { MemoryEventStore } from '../../pkg/data/memory/memory-event-store';
import { DomainEventStore } from '../../pkg/domain/domain-event-store';
import { MockProductIntegration } from '../../pkg/integrations/product/product-integration';
import { createApp } from '../app';
import request from 'supertest';

describe('/healthcheck', () => {
    let app: Express.Application;
    let eventStore: DomainEventStore;

    beforeEach(() => {
        eventStore = new MemoryEventStore();
        app = createApp(eventStore, new MockProductIntegration([]));
    });

    it('should return healthy', async () => {
        const { body, headers, status } = await request(app).get('/healthcheck');

        expect(status).toBe(200);
        expect(body).toEqual({ status: 'healthy' });
        expect(headers['content-type']).toContain('application/json');
    });
});
