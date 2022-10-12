import express from 'express';
import helmet from 'helmet';
import fetch from 'node-fetch';
import pg from 'pg';
import { errorHandler } from '../pkg/http/middleware/error-handler';
import { requestLogger } from '../pkg/shared/logger';
import { AjvValidator } from '../pkg/shared/validation';

interface AppConfig {
    productServiceHost: string;
}

export function createApp(pool: pg.Pool, config: AppConfig) {
    const { productServiceHost } = config;

    const app = express();
    app.use(helmet());
    app.use(express.json());
    app.use(requestLogger);

    app.get('/healthcheck', (_req, res) => res.json({ status: 'healthy' }));

    app.post('/v1/orders/:orderId/add/:itemId', async (req, res, next) => {
        try {
            const orderId = uuidValidator.validate(req.params.orderId);
            const itemId = uuidValidator.validate(req.params.itemId);

            const productResponse = await fetch(`${productServiceHost}/product/${itemId}`);
            if (productResponse.status !== 200) {
                if (productResponse.status === 404) {
                    return res.status(400).json({ message: 'Invalid item' });
                }

                throw new Error(
                    `Product service /product integration threw: ${productResponse.status} ${productResponse.statusText}`
                );
            }
            const productResponsePayload = (await productResponse.json()) as GetProductResponse;
            const item = { id: itemId, ...productResponsePayload };

            const { rows: events } = await pool.query<{ eventType: string; payload: unknown }>(
                `
                    SELECT
                        event_type as "eventType",
                        payload
                    FROM order_context.events
                    WHERE
                        stream_type='ORDER_FLOW' AND
                        stream_id=$1
                    ORDER BY version ASC;
                `,
                [orderId]
            );

            // TODO: this should build an aggregate instead of find an item
            const hasItem = Boolean(
                events
                    .filter((event) => event.eventType === 'ORDER_ITEM_ADDED')
                    .find((event) => {
                        const { itemId } = event.payload as OrderItemAddedPayload;
                        return itemId === item.id;
                    })
            );
            if (hasItem) {
                return res.sendStatus(202);
            }

            // TODO: this should also validate more than just payload
            const event = orderItemAddedPayloadValidator.validate({ itemId: item.id, price: item.price });
            await pool.query(
                `
                        INSERT INTO order_context.events (
                            stream_id,
                            stream_type,
                            version,
                            event_type,
                            payload
                        ) VALUES ($1, $2, $3, $4, $5);
                    `,
                [orderId, 'ORDER_FLOW', events.length + 1, 'ORDER_ITEM_ADDED', JSON.stringify(event)]
            );

            return res.sendStatus(events.length ? 200 : 201);
        } catch (error) {
            next(error);
        }
    });

    app.use(errorHandler);

    return app;
}

interface OrderItemAddedPayload {
    itemId: string;
    price: number;
}

const orderItemAddedPayloadValidator = new AjvValidator<OrderItemAddedPayload>({
    type: 'object',
    properties: {
        itemId: { type: 'string', format: 'uuid' },
        price: { type: 'number' },
    },
    required: ['itemId', 'price'],
    additionalProperties: false,
});

interface GetProductResponse {
    name: string;
    price: number;
}

// TODO: move into pkg as a generic validator
const uuidValidator = new AjvValidator<string>({ type: 'string', format: 'uuid' });
