import { OrderProjection } from '../../domain/order/order-projection';
import { OrderProjectionRepository } from '../../domain/order/order-projection-repo';

export class MemoryOrderProjectionRepository implements OrderProjectionRepository {
    private readonly store: Map<string, OrderProjection>;

    constructor(seed?: Array<[string, OrderProjection]>) {
        this.store = new Map(seed);
    }

    async load(id: string): Promise<OrderProjection> {
        const projection = this.store.get(id);
        if (projection === undefined) {
            return {
                id,
                items: [],
                status: 'IN_PROGRESS',
            };
        }

        return projection;
    }

    async save(projection: OrderProjection) {
        this.store.set(projection.id, projection);
    }

    async loadCompleted(): Promise<OrderProjection[]> {
        return Array.from(this.store.values()).filter((order) => order.status !== 'IN_PROGRESS');
    }
}
