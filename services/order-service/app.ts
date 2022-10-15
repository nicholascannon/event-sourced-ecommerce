import express from 'express';
import helmet from 'helmet';
import pg from 'pg';
import { OrderController } from '../pkg/http/controllers/order-controller';
import { asyncHandler } from '../pkg/http/middleware/async-handler';
import { errorHandler } from '../pkg/http/middleware/error-handler';
import { requestLogger } from '../pkg/shared/logger';

interface AppConfig {
    productServiceHost: string;
}

export function createApp(pool: pg.Pool, config: AppConfig) {
    const { productServiceHost } = config;

    const orderController = new OrderController(pool, productServiceHost);

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
