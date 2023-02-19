import { CONFIG } from '../../config';

export const addToOrder = async (orderId: string, itemId: string) => {
    const res = await fetch(`${CONFIG.orderServiceURL}/v1/orders/${orderId}/add`, {
        method: 'POST',
        body: JSON.stringify({ itemId }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(`Failed to add item to order: ${errorMessage}`);
    }
};
