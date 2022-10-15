import express from 'express';
import helmet from 'helmet';
import { DomainEventStore } from '../pkg/domain/domain-event-store';
import { OrderCommandHandler } from '../pkg/domain/order/order-command-handler';
import { OrderController } from '../pkg/http/controllers/order-controller';
import { asyncHandler } from '../pkg/http/middleware/async-handler';
import { errorHandler } from '../pkg/http/middleware/error-handler';
import { HttpProductService } from '../pkg/integrations/product/product-service';
import { requestLogger } from '../pkg/shared/logger';

interface AppConfig {
    productServiceHost: string;
}

export function createApp(eventStore: DomainEventStore, config: AppConfig) {
    const { productServiceHost } = config;

    const productService = new HttpProductService(productServiceHost);
    const orderCommandHandler = new OrderCommandHandler(eventStore);

    const orderController = new OrderController(orderCommandHandler, productService);

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
