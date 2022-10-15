import { BaseEvent } from '../../event-store/events';

export interface AddItemEvent extends BaseEvent {
    streamType: 'ORDER_FLOW';
    eventType: 'ORDER_ITEM_ADDED';
    payload: {
        itemId: string;
    };
}

export interface CheckedOutEvent extends BaseEvent {
    streamType: 'ORDER_FLOW';
    eventType: 'ORDER_CHECKED_OUT';
    payload: Record<string, never>; // forces empty object
}

export interface OrderConfirmedEvent extends BaseEvent {
    streamType: 'ORDER_FLOW';
    eventType: 'ORDER_CONFIRMED';
    payload: Record<string, never>; // forces empty object
}

export type OrderEvent = AddItemEvent | CheckedOutEvent | OrderConfirmedEvent;
