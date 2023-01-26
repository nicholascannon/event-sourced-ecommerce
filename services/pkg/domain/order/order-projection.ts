export interface OrderProjection {
    id: string;
    status: 'IN_PROGRESS' | 'CHECKED_OUT' | 'CONFIRMED';
    totalPrice: number;
    orderDate?: Date; // date order was confirmed
    items: ItemProjection[];
}

interface ItemProjection {
    id: string;
    name: string;
}
