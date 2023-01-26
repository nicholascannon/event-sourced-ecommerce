import { OrderProjection } from './order-projection';

export interface OrderProjectionRepository {
    load: (id: string) => Promise<OrderProjection>;
    save: (projection: OrderProjection) => Promise<void>;
    // NOTE: probably a good idea to paginate this function but out of scope for now
    loadAll: () => Promise<OrderProjection[]>;
}
