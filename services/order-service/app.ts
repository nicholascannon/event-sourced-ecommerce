import express from 'express';
import helmet from 'helmet';
import { errorHandler } from '../pkg/http/middleware/error-handler';
import { requestLogger } from '../pkg/shared/logger';

export function createApp() {
    const app = express();
    app.use(helmet());
    app.use(express.json());
    app.use(requestLogger);

    app.get('/healthcheck', (_req, res) => res.json({ status: 'healthy' }));

    app.use(errorHandler);

    return app;
}
