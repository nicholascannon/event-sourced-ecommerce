import { BaseEvent } from '../../event-store/events';

export interface AddItemEvent extends BaseEvent {
    streamType: 'CUSTOMER_ORDER';
    eventType: 'ORDER_ITEM_ADDED';
    payload: {
        itemId: string;
        name: string;
    };
}

export interface CheckedOutEvent extends BaseEvent {
    streamType: 'CUSTOMER_ORDER';
    eventType: 'ORDER_CHECKED_OUT';
    payload: {
        totalPrice: number;
    };
}

export interface OrderConfirmedEvent extends BaseEvent {
    streamType: 'CUSTOMER_ORDER';
    eventType: 'ORDER_CONFIRMED';
    payload: Record<string, never>; // forces empty object
}

export type OrderEvent = AddItemEvent | CheckedOutEvent | OrderConfirmedEvent;
