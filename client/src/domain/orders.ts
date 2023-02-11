export type Order = {
    id: string;
    status: OrderStatus;
    items: Item[];
    totalPrice?: number;
    orderDate?: string;
};

export type OrderStatus = 'IN_PROGRESS' | 'CHECKED_OUT' | 'CONFIRMED';

export type Item = {
    id: string;
    name: string;
};

/**
 * Builds an initial state order object given an order ID.
 */
export const buildInitialOrder = (id: string): Order => ({
    id,
    status: 'IN_PROGRESS',
    items: [],
});
