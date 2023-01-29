import { CONFIG } from '../../config';
import { Order } from '../../domain/orders';

// NOTE: should probably paginate this
export const getOrders = async (): Promise<Order[]> => {
    const res = await fetch(`${CONFIG.orderServiceURL}/v1/orders`);
    if (!res.ok) {
        throw new Error(`Failed to fetch orders (${res.status} ${res.statusText})`);
    }

    return res.json();
};
