import { CONFIG } from '../../config';
import { Order } from '../../domain/orders';

export const getOrderById = async (id: string): Promise<Order> => {
    const res = await fetch(`${CONFIG.orderServiceURL}/v1/orders/${id}`);
    if (!res.ok) {
        switch (res.status) {
            case 404:
                throw new Error(`Order ${id} does not exist`);
            case 400:
                throw new Error(`Invalid order ID format: ${id}`);
            default:
                throw new Error(`Unknown error occurred when fetching order ${id} (${res.status} ${res.statusText})`);
        }
    }

    return res.json(); // TODO: could validate API data here? AJV?
};
