export type Order = {
    id: string;
    status: OrderStatus;
    items: Item[];
};

export type OrderStatus = 'IN_PROGRESS' | 'CHECKED_OUT' | 'CONFIRMED';

export type Item = {
    id: string;
    name: string;
};