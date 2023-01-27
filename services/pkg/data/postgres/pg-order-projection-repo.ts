import pg from 'pg';
import { OrderProjection } from '../../domain/order/order-projection';
import { OrderProjectionRepository } from '../../domain/order/order-projection-repo';

export class PgOrderProjectionRepository implements OrderProjectionRepository {
    constructor(private readonly pool: pg.Pool) {}

    async load(id: string): Promise<OrderProjection> {
        const { rows } = await this.pool.query<{ projection: OrderProjection }>(
            `SELECT projection FROM order_context.order_projection WHERE id=$1;`,
            [id]
        );

        if (rows[0] === undefined) {
            return {
                id,
                items: [],
                status: 'IN_PROGRESS',
            };
        }

        return this.mapProjection(rows[0].projection);
    }

    async save(projection: OrderProjection) {
        await this.pool.query(
            `
                INSERT INTO order_context.order_projection(id, projection)
                VALUES ($1, $2)
                ON CONFLICT (id)
                DO UPDATE SET projection=$2;
            `,
            [projection.id, JSON.stringify(projection)]
        );
    }

    async loadAll(): Promise<OrderProjection[]> {
        const { rows: orders } = await this.pool.query<{ projection: OrderProjection }>(
            `SELECT projection FROM order_context.order_projection;`
        );
        return orders.map((order) => this.mapProjection(order.projection));
    }

    private mapProjection(projection: OrderProjection): OrderProjection {
        return {
            id: projection.id,
            items: projection.items,
            totalPrice: projection.totalPrice,
            status: projection.status,
            // NOTE: JavaScript date objects are serialized as strings so they must be converted
            orderDate: projection.orderDate ? new Date(projection.orderDate) : undefined,
        };
    }
}
