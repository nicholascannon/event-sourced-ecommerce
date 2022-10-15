import pg from 'pg';
import fetch from 'node-fetch';
import { Request, Response } from 'express';
import { uuidValidator } from '../../shared/validators';
import { AjvValidator } from '../../shared/validation';

export class OrderController {
    // TODO: further abstraction of these dependencies required
    constructor(private readonly pool: pg.Pool, private readonly productServiceHost: string) {}

    async addItem(req: Request, res: Response): Promise<Response> {
        const orderId = uuidValidator.validate(req.params.orderId);
        const itemId = uuidValidator.validate(req.params.itemId);

        const productResponse = await fetch(`${this.productServiceHost}/product/${itemId}`);
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

        const { rows: events } = await this.pool.query<{ eventType: string; payload: unknown }>(
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
        await this.pool.query(
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
    }
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
