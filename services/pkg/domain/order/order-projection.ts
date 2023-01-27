export interface OrderProjection {
    id: string;
    status: 'IN_PROGRESS' | 'CHECKED_OUT' | 'CONFIRMED';
    items: ItemProjection[];
    totalPrice?: number;
    orderDate?: Date; // date order was confirmed
}

interface ItemProjection {
    id: string;
    name: string;
}
