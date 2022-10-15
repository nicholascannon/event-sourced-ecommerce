import express from 'express';
import helmet from 'helmet';
import { DomainEventStore } from '../pkg/domain/domain-event-store';
import { OrderService } from '../pkg/domain/order/order-service';
import { OrderController } from '../pkg/http/controllers/order-controller';
import { asyncHandler } from '../pkg/http/middleware/async-handler';
import { errorHandler } from '../pkg/http/middleware/error-handler';
import { ProductIntegration } from '../pkg/integrations/product/product-integration';
import { requestLogger } from '../pkg/shared/logger';

export function createApp(eventStore: DomainEventStore, productIntegration: ProductIntegration) {
    const orderService = new OrderService(eventStore);
    const orderController = new OrderController(orderService, productIntegration);

    const app = express();
    app.use(helmet());
    app.use(express.json());
    app.use(requestLogger);

    app.get('/healthcheck', (_req, res) => res.json({ status: 'healthy' }));

    app.post(
        '/v1/orders/:orderId/add/:itemId',
        asyncHandler((req, res) => orderController.addItem(req, res))
    );

    app.use(errorHandler);

    return app;
}
