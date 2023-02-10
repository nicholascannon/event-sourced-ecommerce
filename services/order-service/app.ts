import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { DomainEventStore } from '../pkg/domain/domain-event-store';
import { OrderService } from '../pkg/domain/order/order-service';
import { OrderController } from '../pkg/http/controllers/order-controller';
import { errorHandler } from '../pkg/http/middleware/error-handler';
import { ProductIntegration } from '../pkg/integrations/product/product-integration';
import { requestLogger } from '../pkg/shared/logger';
import { OrderProjectionRepository } from '../pkg/domain/order/order-projection-repo';

export function createApp(
    eventStore: DomainEventStore,
    productIntegration: ProductIntegration,
    orderProjectionRepo: OrderProjectionRepository,
    options?: AppOptions
) {
    const orderService = new OrderService(eventStore, productIntegration, orderProjectionRepo);
    const orderController = new OrderController(orderService);

    const app = express();
    app.use(helmet());
    if (options?.corsOrigins) {
        app.use(cors({ origin: options.corsOrigins }));
    }
    app.use(express.json());
    if (options?.logHttpRequests) {
        app.use(requestLogger);
    }

    app.get('/healthcheck', (_req, res) => res.json({ status: 'healthy' }));
    app.use(orderController.router);
    app.use(errorHandler);

    return app;
}

interface AppOptions {
    logHttpRequests?: boolean;
    corsOrigins?: string[];
}
