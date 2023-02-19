import { CONFIG } from '../../config';

export const checkoutOrder = async (orderId: string) => {
    const res = await fetch(`${CONFIG.orderServiceURL}/v1/orders/${orderId}/checkout`, {
        method: 'POST',
    });

    if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(`Failed to checkout order: ${errorMessage}`);
    }
};
